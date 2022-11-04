import { Injectable } from '@angular/core';
import { menuItem } from './menu/menu.component';
import { initializeApp } from 'firebase/app';
import { getFirestore , collection, getDocs, setDoc, doc } from "firebase/firestore";

const fireBaseApp = initializeApp(  
  {
  apiKey: "AIzaSyAmgkmwQ8MtgUGO2ly5coGzsJ5oeubcJJA",
  authDomain: "shopping-10043.firebaseapp.com",
  projectId: "shopping-10043",
  storageBucket: "shopping-10043.appspot.com",
  messagingSenderId: "883942449110",
  appId: "1:883942449110:web:e75ff03c0f03f5ca1b0e77",
  measurementId: "G-Q8HM2EYG75"
  });

const db = getFirestore();

@Injectable({
  providedIn: 'root'
})
export class MenuDataSourceService {

  

constructor(){}

public async getMenuItems():Promise<menuItem[]>
{
  let returnArray:menuItem[] = new Array();
  const query = await getDocs(collection(db,'menuItems'));
  return new Promise<menuItem[]>((resolve,reject) =>
                {
                  if(query.size < 1){reject('collection menuItems is empty')}
                  else{
                        for(let i=0;i<query.size;i++){ returnArray.push(query.docs[i].data() as menuItem); }
                        resolve(returnArray);
                      }
                });
}

public async getMenuSections():Promise<string[]>
{
  const query = await getDocs(collection(db,'menuItems'));
  return new Promise<string[]>((resolve,reject) =>
  {
    if(query.size < 1){reject('collection menuItems is empty')}
    let menuSectionArray:string[] = new Array();
    let exists:boolean;
      for(let k=0;k < query.docs.length;k++)
      {
        exists = false;
          for(let j of menuSectionArray)
          {
            if(j === query.docs[k].data().section){ exists = true; break; }
          }
        if(!exists){ menuSectionArray.push( query.docs[k].data().section as string) }
      }
    resolve(menuSectionArray) ;              
                });
}

public async setMenuItem(menuItem:menuItem):Promise<string>
{
  let success:boolean = true;
  try{ const docRef = await setDoc(doc(db,'menuItems',menuItem.title),menuItem); }
  catch{ success = false; }
  return new Promise<string>((resolve,reject) => { if(success === true){ resolve('success') }else{ reject('failure') } });
}

}
