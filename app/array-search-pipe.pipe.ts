import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arraySearchPipe'
})
export class ArraySearchPipePipe implements PipeTransform {

  transform(inputArray: any[],prop:string,value:any):any[]//this pipe accepts an array, and returns an array of entries for which the specified property matches "value"
  {
    if( value === 'Results'){return inputArray}
    if(inputArray === undefined){return [];}
    let returnArray:any[] = [];
    for(let i = 0; i < inputArray.length; i++){ if(inputArray[i][prop] === value){returnArray.push(inputArray[i]);} } 
    return returnArray;
  }

}
