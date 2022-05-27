#include <string>
#include <cstdint>

class Base64Converter
{
    string[] computeItoA(uint8_t[] i)//convert byte array to an array of base 64 characters using modular arithmatic to compute the indexes of the corrosponding entries 
    // note that these functions are inverses of eachother
    {
        stringArray = new string[sizeof(i)*8/6];

        for(let index = 0; index < sizeof(i)*8; index++)
        {
            stringArray[index/6][(index+6)%6] = i[index/8][(index+8)%8];
        }

        return stringArray;
    }

    computeAtoI(string[] a)//convert array of base 64 characters to byte array using modular arithmatic to compute the indexes of the corrosponding entries 
    {
        intArray = new uint8_t[sizeof(a)*6/8];

        for(let index = 0; index < sizeof(a)*6; index++)
        {
            intArray[index/8][(index+8)%8] = a[index/6][(index+6)%6];
        }

        return intArray;
    }
}