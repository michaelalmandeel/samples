  setHeight():void
  {//this function calculates the height of a scrolling list to avoid showing partial elements(better look). 
   //each element has a fixed height header, variable height content and a bottom margin. 
   //we ensure our calculated height is < max height. the value is to be propagated to a style binding.
   // this.listItems refers to a Querylist of elementrefs that represent the elements in the list

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

  this.myHeight = (totalContentHeight+(numElements > 0 ? (marginHeight*(numElements-1)) : 0 ))+"px";

  // this.myHeight is the template expression of the style binding. returning this value directly from the function to this expression causes a race condition,
  // as the elements of the QueryList are not yet rendered when their properties are accessed, causing unreliable values(0) for height.
  // a nessecary condition of using this method is that one must call setTimeout(() => this.setHeight()), then subscribe to myQueryList.changes 
  // with setTimeout(() => this.setHeight()) in ngAfterViewInit().
  // this pushes the function onto the event queue behind the current change-detection_dependency-update code,
  // so the correct value for this.myHeight is recorded and reflected in rendering after the next change-detection_dependency-update cycle.
  }
