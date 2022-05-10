class ModularBase64Converter
{
    computeItoA(i)//convert byte array to an array of base 64 characters using modular arithmatic to compute the indexes of the corrosponding entries 
    // note that these functions are inverses of eachother
    {
        let charArray = new Array(Uint16Array);

        for(let index = 0; index < i.length*8; index++)
        {
            charArray[index/6].at((index+6)%6) = i[index/8].at((index+8)%8);
        }

        return charArray;
    }

    computeAtoI(a)//convert array of base 64 characters to byte array using modular arithmatic to compute the indexes of the corrosponding entries 
    {
        let intArray = new Array(Uint8Array);

        for(let index = 0; index < i.length*8; index++)
        {
            intArray[index/8].at((index+8)%8) = a[index/6].at((index+6)%6);
        }

        return intArray;
    }
}