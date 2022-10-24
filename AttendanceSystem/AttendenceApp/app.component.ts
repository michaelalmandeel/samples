import { Component, ElementRef, QueryList, ViewChild, ViewChildren ,AfterViewInit} from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore , collection, getDocs, getDoc , setDoc, doc } from "firebase/firestore";
import {IonSelect} from '@ionic/angular';

interface classSection//this is a prototype for the objects we will be storing in the 'classes' collection
{
  instructorEmail:string;//name of instructor
  semester:string;
  className:string;
  classSection:string;
  students:{studentName:string,studentId:string,hasDefaulted:boolean,attendance:{state:string,date:string}[]}[];
  /*an array of students. each student has a name and id like the instructors. hasDefaulted is true/false and indicates default status. the attendance array
  contains numbers, 1 = present, 2 = absent, 3 = excused.*/
}
class classObject implements classSection
{
  constructor()
  {
   this.instructorEmail = '';
   this.className = '';
   this.classSection = '';
   this.semester = '';
   this.students = [];
  }

  instructorEmail:string;//name of instructor
  className:string;//name of the class
  semester:string;
  classSection:string;
  students:{studentName:string,studentId:string,hasDefaulted:boolean,attendance:{state:string,date:string}[]}[];
}

interface student
{
  studentName:string;
  studentId:string;
  classes:{className:string,semester:string,hasDefaulted:boolean,attendance:{state:string,date:string}[],section:string}[];/* an array of objects, each of which represents a 
  a class the student is taking or has taken. there is an attendance array for each class*/
}


class studentObject implements student
{
  constructor()
  {
    this.studentName = '';
    this.studentId = '';
    this.classes = [];
  }
  studentName:string;
  studentId:string;
  classes:{className:string,semester:string,hasDefaulted:boolean,attendance:{state:string,date:string}[],section:string}[];
}

//Firebase configuration
const app = initializeApp(  
  {
  apiKey: "AIzaSyBPQrYj4WBxCdlacBxXrqz6p3db3n00MNY",
  authDomain: "attendencesystem-b67f0.firebaseapp.com",
  projectId: "attendencesystem-b67f0",
  storageBucket: "attendencesystem-b67f0.appspot.com",
  messagingSenderId: "605019644295",
  appId: "1:605019644295:web:982a74f26f73131102f322"
});

const db = getFirestore();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent
{
  @ViewChildren(IonSelect) mySelects:QueryList<IonSelect>;
  @ViewChildren('studentid') myStudents:QueryList<any>;
  @ViewChild('header',{read: ElementRef}) myHeader:ElementRef;
  @ViewChild('content',{read: ElementRef}) myContent:ElementRef;

  instructorEmail:string = '';
  isLoggedIn:boolean = false;
  email:string;
  password:string;
  tempClasses:classSection[] = [];

  getIsLoggedIn():boolean{return this.isLoggedIn}
  logOut(input:any[]):void
  { 
    this.clearInputs(input); this.isLoggedIn = false; 
    this.myClasses = []; 
    this.listTitle = "LOGIN";
    this.email = undefined;
    this.password = undefined;  
  }
  setEmail(str:Event){this.email = (str.target as HTMLInputElement).value; console.log("set email: "+this.email);}
  setPassword(str:Event){this.password = (str.target as HTMLInputElement).value; console.log("set password: "+this.password);}

  logIn():void
  {
    console.log(" logging in... ");
    this.getClassesCollection().then((data) => {this.classes = data; console.log(" downloaded classes: "+this.classes);} )
                               .then(() => {this.classes
                                            .forEach( (element) => { if(element.instructorEmail === this.email){this.tempClasses.push(element);console.log(" selecting class: "+element)} });
                                            this.myClasses = this.tempClasses;
                                            this.isLoggedIn = true;
                                            if(this.tempClasses.length > 0){this.listTitle = "choose class"}
                                            this.tempClasses = [];
                                           })
                               .then(() => {
                                              this.getStudentsCollection().then((data) => this.students = data );
                                           });

  }

  myClasses:classSection[] = [];
  /*this contains all classes taught by this professor. when the program launches, the classes collection will be downloaded
   and searched for all classes with the instructors email in the current semester. current semester is determined by comparing the semester strings and 
   only keeping the latest ones. first find the highest year, than semester where winter>fall>summer>spring */
   getHeight():string
   {
    if(this.myContent === undefined || this.myHeader === undefined){return '0px';}
     if(this.myContent.nativeElement.offsetHeight === 0 || this.myHeader.nativeElement.offsetHeight === 0 ){return '0px';}
    return ((this.myContent.nativeElement.offsetHeight-this.myHeader.nativeElement.offsetHeight)-100).toString()+'px';
   }
  currentClass:classSection = {instructorEmail:'',className:'',semester:'',classSection:'',students:[]}//the currently selected class from myClasses
  setCurrentClass(myclass:classSection):void{this.currentClass = myclass}
  closeClassPopover:boolean = false;
  authorized:boolean = false;//initially access is denied. once authenticated, this will be set to true and user will proceed to main app
  classes:classSection[];//this array stores the working set of classes that you d/l from firebase.
  students:student[];//this array stores the working set of students that you d/l from firebase.
  attendenceData:{studentId:string,state:string,date:string}[] = [];
  clearInputs(input:any[]):void{for(let i of input){i.value = '';}}
  listTitle:string = "LOGIN";
  onClassSelect(index:number,popover:any):void
  {
    this.currentClass = this.myClasses[index];
    this.listTitle = this.currentClass.className+" "+this.currentClass.classSection;
    console.log(" header height: "+this.myHeader.nativeElement.offsetHeight+" ");
    console.log(" content height: "+this.myContent.nativeElement.offsetHeight+" ");
    popover.dismiss();
  }
  markAll():void
  {
    for(let i = 0; i < this.mySelects.length; i++)
    {
      this.mySelects.get(i).value = "present";
      this.mySelects.get(i).placeholder = "Present ";
    }
  }
  recordAttendence():void
  {
    let section = this.listTitle.slice(this.listTitle.length-2);
    let className = this.listTitle.slice(0,this.listTitle.length-3);
    for(let i = 0; i < this.mySelects.length; i++)
    {
      this.attendenceData.push({state:this.mySelects.get(i).value,studentId:this.myStudents.get(i).nativeElement.innerText,date:Date()});
      //next, update both classSection and student objects, then upload
    }

    this.myClasses.forEach((myClass) => 
                   {
                     if(myClass.className === className && myClass.classSection === section)
                     {
                       for(let i = 0;i < this.attendenceData.length;i++)//for each attendence object that corrosponds to this class
                       {
                         for(let j = 0; j < myClass.students.length;j++)//update student attendence in classSection object(myClass)
                         {
                           if(this.attendenceData[i].studentId === myClass.students[j].studentId)//finds the entry in students array that matches studentId
                           {
                              myClass.students[j].attendance.push({state:this.attendenceData[i].state,date:this.attendenceData[i].date});//update attendence for student
                           }
                         }

                        for(let j = 0;j < this.students.length;j++)
                        {
                          if(this.attendenceData[i].studentId === this.students[j].studentId)//finds the entry in students array that matches studentId
                          {
                            let found = false;
                            this.students[j].classes.forEach((studentClass) => 
                            { 
                              if(studentClass.className === className && studentClass.section === section) 
                              {
                                found = true;
                                studentClass.attendance.push({state:this.attendenceData[i].state,date:this.attendenceData[i].date});
                              }
                            });
                            if(!found)
                            {
                              this.students[j].classes.push( {className:myClass.className,semester:myClass.semester,section:myClass.classSection,hasDefaulted:false,attendance:[{state:this.attendenceData[i].state,date:this.attendenceData[i].date}] });
                            }
                            this.addStudentToDb(this.students[j]).then(() => {});
                          }
                        }                     
                      }
                      this.addClassToDb(myClass).then(() => {});
                    }
                   });
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getClassesCollection():Promise<classSection[]>//read all classes from firebase
  {
    let returnArray:classSection[] = new Array();
    const query = await getDocs(collection(db,'classes'));
    return new Promise<classSection[]>((resolve,reject) =>
                  {
                    if(query.size < 1){reject("collection 'classes' is empty")}
                    else{
                          for(let i=0;i<query.size;i++){ returnArray.push(query.docs[i].data() as classSection); }
                          resolve(returnArray);
                        }
                  });
  }

  async getStudentsCollection():Promise<student[]>//read all students from firebase
  {
    let returnArray:student[] = new Array();
    const query = await getDocs(collection(db,'students'));
    return new Promise<student[]>((resolve,reject) =>
                  {
                    if(query.size < 1){reject("collection 'students' is empty")}
                    else{
                          for(let i=0;i<query.size;i++){ returnArray.push(query.docs[i].data() as student); }
                          resolve(returnArray);
                        }
                  });
  }

  async addStudentToDb(student:student):Promise<string>//add a student to firebase
  {
    let success:boolean = true;
    try{ const docRef = await setDoc(doc(db,'students',student.studentId),student); }
    catch{ success = false; }
    return new Promise<string>((resolve,reject) => { if(success === true){ resolve("added "+student.studentName+" to 'students'") }else{ reject("FAILED: couldn't write to database") } });
  }

  async addClassToDb(currentClass:classSection):Promise<string>//add a class to firebase
  {
    let success:boolean = true;
    try{ const docRef = await setDoc(doc(db,'classes',(currentClass.className+currentClass.classSection+currentClass.semester)),currentClass); }
    catch{ success = false; }
    return new Promise<string>((resolve,reject) => { if(success === true){ resolve("added "+currentClass.className+" to 'classes'") }else{ reject("FAILED: couldn't write to database") } });
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  compareWith(o1:classSection, o2:classSection){return o1.className+o1.classSection === o2.className+o2.classSection;}

  constructor() {}

}
