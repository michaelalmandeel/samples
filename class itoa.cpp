#include <string>
#include <cstdint>

class Base64Converter
{
    char[] computeItoA(uint8_t[] i)//convert byte array to an array of base 64 characters using modular arithmatic to compute the indexes of the corrosponding entries 
    // note that these functions are inverses of eachother
    {
        charArray = new char[sizeof(i)*8/6];

        for(int index = 0; index < sizeof(i)*8; index++)
        {
            charArray[index/6][(index+6)%6] = i[index/8][(index+8)%8];
        }

        return charArray;
    }

    uint8_t[] computeAtoI(char[] a)//convert array of base 64 characters to byte array using modular arithmatic to compute the indexes of the corrosponding entries 
    {
        intArray = new uint8_t[sizeof(a)*6/8];

        for(int index = 0; index < sizeof(a)*6; index++)
        {
            intArray[index/8][(index+8)%8] = a[index/6][(index+6)%6];
        }

        return intArray;
    }
}
