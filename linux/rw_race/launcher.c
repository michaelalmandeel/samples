#include <unistd.h>
#include <sys/wait.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

#define BUFFER_SIZE 10

typedef struct{ int bfr_data_element_value; } item;

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

// This parent process initializes a shared memory buffer which contains the global constants, variables, and the r/w buffer.

// The parent then forks and execs twice, calling the reader and writer executables.

// The parent process passes parameters(null terminated strings) to each executable: the name of the target executable at argv[0] ,

// The shared memory segment identifier(a string) at argv[1] ,

// and 2*zero+ strings which describe the names and offsets of the global data objects within the shared memory buffer, formatted as follows:

// argv[2*(k+1)] = 'name' , argv[2*(k+1)+1] = 'offset' .  offset is an int, the bytes of which are casted into chars to form a null terminated string

// and at argv[size-1] , a null pointer


int main(int argc, char * argv[])
{
    uint8_t done = 0;
    uint16_t in = 0;
    uint16_t counter = 0;
    uint16_t out = 0;
    uint16_t buffer_size = BUFFER_SIZE;
    uint32_t shared_buffer_length = sizeof(uint16_t)*4 + sizeof(item)*buffer_size ; // number of bytes required for shared memory buffer

    printf("launcher: started launcher\n");
    printf("launcher: shared buffer length - %d\n",shared_buffer_length);

    char * arg_array[15] ; 
    // represents argv for executables we exec
    // structure: 0(executable name) + 1(shm identifier) + 2-11(global object metadata) + 12(null terminator)

    arg_array[1] = "/hw1_shared_mem_region" ; // write object identifiers to what will be argv
    arg_array[2] = "in" ;
    arg_array[4] = "counter" ;
    arg_array[6] = "out" ;
    arg_array[8] = "buffer_size" ;
    arg_array[10] = "buffer" ;
    arg_array[12] = "shared_buffer_length" ;
    arg_array[14] = NULL ;

    uint16_t offset = 0 ; 

    for(int i = 3; i <= 11; i = i+2) // write offsets for the identifiers to what will be argv
    { 
        arg_array[i] = uint32_to_hex_string( (uint32_t)offset , 2 ) ; // this null terminated string stores the int in hex with the highest order nibble first
        offset = offset + sizeof(uint16_t) ;
    }

    arg_array[13] = uint32_to_hex_string( shared_buffer_length , 4 ) ; // store shm size last. this is used by other programs for the mmap operation
    printf("launcher: shared buffer length (in argv)- %s\n",arg_array[13]);
    
    printf("launcher: initialized shm metadata in argv to be passed to exec\n");

    int shm_descriptor = shm_open( "/hw1_shared_mem_region" , O_RDWR | O_CREAT , 0666 ); // create shared memory buffer

    printf("launcher: shared memory buffer created\n");

    int truncate_result = ftruncate( shm_descriptor , shared_buffer_length ); // set buffer size to accomadate all global data
      
    void * shm_ptr = mmap( NULL , shared_buffer_length , PROT_READ | PROT_WRITE , MAP_SHARED , shm_descriptor , 0 ); // proxy shm in local image

    printf("launcher: mapped shm buffer to local address space, ptr = %p\n" , shm_ptr);
 
    *((uint16_t *)shm_ptr) = in ; // write initial values of global data to shared memory buffer
    *(((uint16_t *)shm_ptr)+1) = counter ;
    *(((uint16_t *)shm_ptr)+2) = out ;
    *(((uint16_t *)shm_ptr)+3) = buffer_size ;

    printf("launcher: initialized global data values to shm buffer\n");

    int parent_pid = getpid(); // get parent pid
    
    int producer_code;
    int consumer_code;

    int producer_pid = fork() ;
    
    if( if producer_pid == 0 )
    { 
        printf("launcher: initiating producer executable...\n");
        arg_array[0] = "producer" ;
        execv( "producer" , arg_array ) ;
    }
    
   
    int consumer_pid = fork() ;
    
    if( consumer_pid == 0 )
    { 
        printf("launcher: initiating consumer executable...\n");
        arg_array[0] = "consumer" ;
        execv( "consumer" , arg_array ) ;
    }
    
   for(int i = 3; i <= 11; i = i+2){free(arg_array[i]);}
    
    waitpid(producer_pid , &producer_code , 0);
    
    waitpid(consumer_pid , &consumer_code , 0);
    
    return 0;
}



