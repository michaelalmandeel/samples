class ipv4Fragment
{
    #include <string.h>

    private static unsigned short int frame_hdr_len = 14;
    private static unsigned short int datagram_hdr_len = 20;
    private static unsigned short int ip_payload_offset = 20;
    private static unsigned short int total_length_offset = 2;
    private static unsigned short int fragment_offset = 6;
    
    
    public static void fragment(int mtu,unsigned char * frame_hdr,unsigned char * datagram,unsigned char * buffer)
    {
        unsigned short int fragmentSize = (mtu-(frame_hdr_len+datagram_hdr_len)) - (mtu-(frame_hdr_len+datagram_hdr_len))%8; 
        unsigned short int srcTotalLength = 0;
        memmove( &srcTotalLength , datagram+total_length_offset+1 , 1 );
        memmove( &srcTotalLength+1 , datagram+total_length_offset , 1 );
        unsigned short int numFragments = ( (srcTotalLength-datagram_hdr_len)/fragmentSize ) + ( (srcTotalLength-datagram_hdr_len)%fragmentSize > 0 ) ? 1 : 0);
        unsigned short int lastFragmentSize = ( (srcTotalLength-datagram_hdr_len)%fragmentSize > 0 ) ? (srcTotalLength-datagram_hdr_len)%fragmentSize : fragmentSize);
        unsigned short int bufferIndex = 0;
        unsigned short int totalLength = datagram_hdr_len+fragmentSize;
        unsigned short int fragmentOffsetVal = (((unsigned short int)datagram[frame_hdr_len+fragment_offset])*256 + ((unsigned short int)datagram[frame_hdr_len+fragment_offset+1])&(0x1FFF))*8;
        unsigned char * header = new unsigned char[frame_hdr_len+datagram_hdr_len+fragmentSize];
       
        memmove( header , frame_hdr , frame_hdr_len );//append frame header
        memmove( header+frame_hdr_len , datagram , datagram_hdr_len );//append ip header
        memmove( header+frame_hdr_len+total_length_offset+1 , (unsigned char *)&totalLength , 1);//set total length(lower byte)
        memmove( header+frame_hdr_len+total_length_offset , (unsigned char *)&totalLength+1 , 1);//set total length(lower byte)
        header[frame_hdr_len+fragment_offset] = header[frame_hdr_len+fragment_offset]|0x20;//set more flag to 1 by or-ing flags byte with 32    
        for(unsigned short int i = ip_payload_offset;i <= ip_payload_offset+((numFragments-1)*fragmentSize);i += fragmentSize) //construct all frames except the last frame
        {
          memmove( buffer+((bufferIndex++)*(frame_hdr_len+datagram_hdr_len+fragmentSize))+frame_hdr_len+datagram_hdr_len , datagram+i , fragmentSize);//copy appropriate segment of datagram payload to the buffer
          header[frame_hdr_len+fragment_offset] = ((unsigned char)((fragmentOffsetVal+(i-ip_payload_offset))/2048))&(header[frame_hdr_len+fragment_offset]&0xE0);//set 1st byte of fragment offset
          header[frame_hdr_len+fragment_offset+1] = (unsigned char)(((fragmentOffsetVal+(i-ip_payload_offset))/8)&00FF);//set second byte of fragment offset
          memmove( buffer+((bufferIndex++)*(frame_hdr_len+datagram_hdr_len+fragmentSize)) , header , frame_hdr_len+datagram_hdr_len );//copy header to buffer
        }
        totalLength = lastFragmentSize+datagram_hdr_len;
        memmove( header+frame_hdr_len , datagram , datagram_hdr_len );//append ip header
        memmove( header+frame_hdr_len+total_length_offset+1 , (unsigned char *)&totalLength , 1);//set total length(lower byte)
        memmove( header+frame_hdr_len+total_length_offset , (unsigned char *)&totalLength+1 , 1);//set total length(lower byte)
        header[frame_hdr_len+fragment_offset] = ((unsigned char)((fragmentOffsetVal+(fragmentSize*(numFragments-1)))/2048))&(header[frame_hdr_len+fragment_offset]&0xE0);//set 1st byte of fragment offset
        header[frame_hdr_len+fragment_offset+1] = (unsigned char)(((fragmentOffsetVal+(fragmentSize*(numFragments-1)))/8)&00FF);//set second byte of fragment offset
        memmove( buffer+((bufferIndex)*(frame_hdr_len+datagram_hdr_len+fragmentSize))+frame_hdr_len+datagram_hdr_len , datagram+datagram_hdr_len+((numFragments-1)*fragmentSize) , lastFragmentSize);//copy appropriate segment of datagram payload to the new datagram
        memmove( buffer+(bufferIndex*(frame_hdr_len+datagram_hdr_len+fragmentSize)) , header , frame_hdr_len+datagram_hdr_len );
        delete header;
        return;
    }
}
