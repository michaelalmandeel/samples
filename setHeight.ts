  setHeight():void
  {//this function calculates the height of a scrolling list to avoid showing partial elements(better look). 
   //each element has a fixed height header, variable height content and a bottom margin. 
   //we ensure our calculated height is < max height. the value is to be propagated to a style binding.
   // this.listItems refers to a querylist of elementrefs that represent the elements in the list

    let totalContentHeight:number = 0;//used to record the running total of content heights
    let previousHeight:number = 0;//used to record the previous running total
    let marginHeight:number = 10;
    let maxHeight:number = 400;
    let numElements:number = 0;

    for(let i = 0; i < this.listItems.length; i++)// for each content element
    {
      previousHeight = totalContentHeight;//record total before increase
      totalContentHeight += this.listItems.get(i).nativeElement.scrollHeight;// calculate running total of content height

      if( (totalContentHeight+(i*marginHeight)) > maxHeight )//max height exceeded
      { 
        totalContentHeight = (i === 0 ? maxHeight : previousHeight);//height is previous height if more than one item,  maxheight otherwise
        break;
      }
      
      numElements++;
    }

  this.myHeight = (totalContentHeight+(numElements > 0 ? (marginHeight*(numElements-1)) : 0 ))+"px";//this.myHeight is the template expression of the style binding

  }
