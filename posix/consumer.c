#include <unistd.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

typedef struct{ int bfr_data_element_value; } item;

uint32_t hex_string_to_uint32(char * str)
{
    int final_digit = 0 ;

    for(int i = 0; i <= 255; i++)
    { 
        if( str[i] == '\0' )
        { 
            final_digit = i ; 
            if( final_digit == 0 ){ return 0 ; }
            i = 256 ; 
        }  
    }

    final_digit-- ;

    uint32_t accumulator = 0 ;
    uint32_t multiplier = 1 ;

    for(int i = final_digit; i > -1; i--)
    {
        accumulator = accumulator + (((uint32_t)str[i])-48)*multiplier ;
        multiplier = multiplier*16 ;
    }

   return accumulator ; 
}

char * uint32_to_hex_string( uint32_t num , int num_bytes )
{
    int num_nibbles = num_bytes*2 ;
    char * temp = (char *)malloc(num_nibbles+1);
    int shift_num = num_nibbles-1 ; // used to determine # of shifts for binary and-ing

    for(int i = 0; i < num_nibbles; i++ )
    {
        temp[i] = (((num >> (4*shift_num)) & 0xF)+48) ;
        shift_num-- ;
    }

    temp[num_nibbles] = '\0' ;

    return temp ;
}

int consumer_race_cond(uint32_t last_snap , uint32_t now_snap , uint16_t buffer_size) // this function detects a race condition (the producers count++ is interupted)
{
    uint16_t counter_0 = *((uint16_t *)(&last_snap+1)) ;
    uint16_t in_0 = *((uint16_t *)(&last_snap)) ;

    uint16_t counter_1 = *(((uint16_t *)(&now_snap))+1) ;
    uint16_t in_1 = *((uint16_t *)(&now_snap)) ;

    counter_1++ ;

    uint16_t count_moved = counter_1 - counter_0 ;

    if( ((in_0+count_moved)%buffer_size) == in_1 ){ return 0 ; }
   
    return 1 ;
}

// This program writes data to a shared memory buffer, utilizing global data in shared memory to perform its task

// metadata about the locations of data within the shared memory buffer is located in argv[]

// we access the shared memory using a void pointer, which references a mapped region in our own address space
// which mirrors the shared memory buffer.

// note that there is additional logic based on taking snapshots which detects when a race condition has occured. 
// its reliability requires that 32 bit dma operations are effectively atomic. 

// if not, the detection logic can experience a race condition of its own:
// being interrupted during snapshot sequence. after that point, behavior is undefined.

int main(int argc, char* argv[])
{
    uint16_t in_offset = 0 ;
    uint16_t out_offset = 0 ;
    uint16_t counter_offset = 0 ;
    uint16_t buffer_size_offset = 0 ;
    uint16_t buffer_offset = 0 ;
    uint32_t shared_buffer_length = 0 ;

    printf("consumer: consumer started...\n");
    for(int i = 0; i < argc; i++){ printf("consumer: argv entry %d: %s\n",i,argv[i]); }

    int search_index = 2 ; //start searching argv at the first global data symbol

    while( search_index < argc)
    {
        if(argv[search_index] == "in"){ in_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; }
        if(argv[search_index] == "out"){ out_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; }
        if(argv[search_index] == "counter"){ counter_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; }                     
        if(argv[search_index] == "buffer_size"){ buffer_size_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; } 
        if(argv[search_index] == "buffer"){ buffer_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; }
        if(argv[search_index] == "shared_buffer_length"){ shared_buffer_length = hex_string_to_uint32(argv[search_index+1]) ; }  
        search_index = search_index+2 ;
    }

    int shm_descriptor = shm_open( argv[1] , O_RDWR , 0666 ); // get handle to shared memory buffer
    printf("consumer: obtained shm file descriptor # %d\n",shm_descriptor);

    void * shm_ptr = mmap( NULL , shared_buffer_length , PROT_READ | PROT_WRITE , MAP_SHARED , shm_descriptor , 0 ); // proxy shm in local image

    printf("consumer: mapped shm buffer to local address space\n");

    uint32_t last_snapshot = 0 ; // these are used to detect when a race condition has occurred 
    uint32_t current_snapshot = 0 ;

    item next_consumed ;

    while(1)
    {
        while( *((uint16_t *)(shm_ptr+counter_offset)) == 0 ){ ; /* do nothing */ }

        next_consumed = ((item *)(shm_ptr+buffer_offset))[ *((uint16_t *)(shm_ptr+out_offset)) ] ; // write a new item to the buffer

        *((uint16_t *)(shm_ptr+out_offset)) = ((*((uint16_t *)(shm_ptr+out_offset)))+1) % *((uint16_t *)(shm_ptr+buffer_size_offset)) ; // clock tick

        last_snapshot = *((uint32_t *)(shm_ptr+in_offset)) ; // take snapshot of counter and out atomically(?) for race detection

        (*((uint16_t *)(shm_ptr+counter_offset)))-- ; // increment count (this is when the race condition can occur)

        current_snapshot = *((uint32_t *)(shm_ptr+in_offset)) ; // take snapshot of counter and out atomically(?) for race detection

        if( consumer_race_cond( last_snapshot , current_snapshot , *((uint16_t *)(shm_ptr+buffer_size_offset)) ) )
        { 
            printf("consumer: /////////////////////////////\n");
            printf("consumer: /////////////////////////////\n"); 
            printf("consumer: /////////////////////////////\n"); 
            printf("consumer: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");  
            printf("consumer: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");  
            printf("consumer: !! race condition detected !!\n"); 
            printf("consumer: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");  
            printf("consumer: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");  
            printf("consumer: /////////////////////////////\n"); 
            printf("consumer: /////////////////////////////\n"); 
            printf("consumer: /////////////////////////////\n"); 
            return 0;
        }
    }

    return 0;
}
