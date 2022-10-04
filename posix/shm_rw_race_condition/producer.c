#include <unistd.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdint.h>

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
    char temp[num_nibbles+1] ;
    int shift_num = num_nibbles-1 ; // used to determine # of shifts for binary and-ing

    for(int i = 0; i < num_nibbles; i++ )
    {
        temp[i] = (((num >> (4*shift_num)) & 0xF)+48) ;
        shift_num-- ;
    }

    temp[num_nibbles] = '\0' ;

    return temp ;
}

int producer_race_cond(uint32_t last_snap , uint32_t now_snap , uint16_t buffer_size) // this function detects a race condition (the producers count++ is interupted)
{
    uint16_t counter_0 = *((uint16_t *)(&last_snap)) ;
    uint16_t out_0 = *(((uint16_t *)(&last_snap))+1) ;

    uint16_t counter_1 = *((uint16_t *)(&now_snap)) ;
    uint16_t out_1 = *(((uint16_t *)(&now_snap))+1) ;

    counter_0++ ;

    uint16_t count_moved = counter_0 - counter_1 ;

    if( ((out_0+count_moved)%buffer_size) == out_1 ){ return 0 ; }
   
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
    printf("producer: producer started...\n");
    for(int i = 0; i < argc; i++){ printf("producer: argv entry %d: %s\n",i,argv[i]); }

    int search_index = 2 ; //start searching argv at the first global data symbol

    while( search_index < argc)
    {
        switch(argv[search_index])
        {
            case "in":
                        uint16_t in_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; 
                        break ;    
            case "out":
                        uint16_t out_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ;  
                        break ;    
            case "counter":
                        uint16_t counter_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; 
                        break ;      
            case "buffer_size":
                        uint16_t buffer_size_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ;
                        break ;      
            case "buffer":
                        uint16_t buffer_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ;  
                        break ;      
            case "shared_buffer_length":
                        uint32_t shared_buffer_length = hex_string_to_uint32(argv[search_index+1]) ; 
                        break ;    
            default:
                        break;             
        }

        search_index = search_index+2 ;
    }

    int shm_descriptor = shm_open( argv[1] , O_RDWR , 0666 ); // get handle to shared memory buffer
    printf("producer: obtained shm file descriptor # %d\n",shm_descriptor);

    void * shm_ptr = mmap( NULL , shared_buffer_length , PROT_READ | PROT_WRITE , MAP_SHARED , shm_descriptor , 0 ); // proxy shm in local image

    printf("producer: mapped shm buffer to local address space\n");

    uint32_t last_snapshot = 0 ; // these are used to detect when a race condition has occurred 
    uint32_t current_snapshot = 0 ;

    item next_produced ;

    while(true)
    {
        next_produced.bfr_data_element_value = 100 ; /* produce an item in next produced */

        while( *((uint16_t *)(shm_ptr+counter_offset)) == *((uint16_t *)(shm_ptr+buffer_size_offset)) ){ ; /* do nothing */ }

        ((item *)(shm_ptr+buffer_offset))[ *((uint16_t *)(shm_ptr+in_offset)) ] = next_produced ; // write a new item to the buffer

        *((uint16_t *)(shm_ptr+in_offset)) = ((*((uint16_t *)(shm_ptr+in_offset)))+1) % *((uint16_t *)(shm_ptr+buffer_size_offset)) ; // clock tick

        last_snapshot = *((uint32_t *)(shm_ptr+counter_offset)) ; // take snapshot of counter and out atomically(?) for race detection

        (*((uint16_t *)(shm_ptr+counter_offset)))++ ; // increment count (this is when the race condition can occur)

        current_snapshot = *((uint32_t *)(shm_ptr+counter_offset)) ; // take snapshot of counter and out atomically(?) for race detection

        if( producer_race_cond( last_snapshot , current_snapshot , *((uint16_t *)(shm_ptr+buffer_size_offset)) ) )
        { 
            printf("producer: /////////////////////////////\n");
            printf("producer: /////////////////////////////\n"); 
            printf("producer: /////////////////////////////\n"); 
            printf("producer: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");  
            printf("producer: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");  
            printf("producer: !! race condition detected !!\n"); 
            printf("producer: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");  
            printf("producer: @@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");  
            printf("producer: /////////////////////////////\n"); 
            printf("producer: /////////////////////////////\n"); 
            printf("producer: /////////////////////////////\n"); 
            return 0;
        }
    }

    return 0;
}

