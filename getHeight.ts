  setHeight():void
  {//this function calculates the height of a scrolling list to avoid showing partial elements(better look). 
   //each element has a fixed height header, variable height content and n-1 bottom margins. 
   //we ensure our calculated height is < max height. the value is to be returned to a style binding.
   // this.listItems refers to a querylist of elementrefs that represent the elements in the list

    let totalContentHeight = 0;//to calculate running total of content height;
    let previousHeight = 0;//used to record the previous running total
    let marginHeight = 10;
    let maxHeight = 480;
    let numElements = 0;

    for(let i = 0; i < this.listItems.length; i++)// for each content element
    {
      previousHeight = totalContentHeight;//record total before increase
      totalContentHeight += this.listItems.get(i).nativeElement.scrollHeight;// calculate running total of content height

      if( (totalContentHeight+(i*marginHeight)) > maxHeight )//max height exceeded
      { 
        totalContentHeight = (i === 0 ? totalContentHeight : previousHeight);
        break;
      }
      numElements++;
    }
  this.myHeight = (totalContentHeight+(numElements > 0 ? (marginHeight*(numElements-1)) : 0 ) )+"px";//this.myHeight determines height style binding
  }
