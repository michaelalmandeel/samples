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


// This program writes data to a shared memory buffer, utilizing global data in shared memory to perform its task

// metadata about the locations of data within the shared memory buffer is located in argv[]

// we access the shared memory using a void pointer, which references a mapped region in our own address space
// which mirrors the shared memory buffer.

int main(int argc, char* argv[])
{
    uint16_t in_offset = 0 ;
    uint16_t out_offset = 0 ;
    uint16_t counter_offset = 0 ;
    uint16_t buffer_size_offset = 0 ;
    uint16_t buffer_offset = 0 ;
    uint32_t shared_buffer_length = 0 ;

    printf("consumer: consumer started...\n");

    int search_index = 2 ; //start searching argv at the first global data symbol

    while( search_index < argc-1 )
    {
        if(strcmp(argv[search_index],"in") == 0){ in_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; }
        if(strcmp(argv[search_index],"out") == 0){ out_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; }
        if(strcmp(argv[search_index],"counter") == 0){ counter_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; }                     
        if(strcmp(argv[search_index],"buffer_size") == 0){ buffer_size_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; } 
        if(strcmp(argv[search_index],"buffer") == 0){ buffer_offset = (uint16_t) hex_string_to_uint32(argv[search_index+1]) ; } 
        if(strcmp(argv[search_index],"shared_buffer_length") == 0){ shared_buffer_length = hex_string_to_uint32(argv[search_index+1]) ; } 

        search_index = search_index+2 ;   
    }

    int shm_descriptor = shm_open( argv[1] , O_RDWR , 0666 ); // get handle to shared memory buffer
    printf("consumer: obtained shm file descriptor # %d\n",shm_descriptor);

    void * shm_ptr = mmap( NULL , shared_buffer_length , PROT_READ | PROT_WRITE , MAP_SHARED , shm_descriptor , 0 ); // proxy shm in local image

    printf("consumer: mapped shm buffer to local address space\n");

    item next_consumed ;

    while(1)
    {
        while( *((uint16_t *)(shm_ptr+counter_offset)) == 0 ){ ; /* do nothing */ }

        next_consumed = ((item *)(shm_ptr+buffer_offset))[ *((uint16_t *)(shm_ptr+out_offset)) ] ; // write a new item to the buffer

        *((uint16_t *)(shm_ptr+out_offset)) = ((*((uint16_t *)(shm_ptr+out_offset)))+1) % *((uint16_t *)(shm_ptr+buffer_size_offset)) ; // clock tick

        (*((uint16_t *)(shm_ptr+counter_offset)))-- ; // increment count (this is when the race condition can occur)
    }

    exit(0);
    return 0;
}
