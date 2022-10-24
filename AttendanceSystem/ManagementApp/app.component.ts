import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore , collection, getDocs, getDoc , setDoc, doc } from "firebase/firestore";

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

interface instructor
{
 name:string;
 email:string;
 password:string;
}

interface student
{
  studentName:string;
  studentId:string;
  classes:{className:string,semester:string,hasDefaulted:boolean,attendance:{state:string,date:string}[],section:number}[];/* an array of objects, each of which represents a 
  a class the student is taking or has taken. there is an attendance array for each class*/
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
export class AppComponent implements AfterViewInit{

 stopEvent(evt:Event){evt.stopPropagation()}

  @ViewChild('grid',{read:ElementRef}) grid:ElementRef;

  authorized:boolean = false;//initially access is denied. once authenticated, this will be set to true and user will proceed to main app
  classes:classSection[];//this array stores the working set of classes that you d/l from firebase.
  students:student[];//this array stores the working set of students that you d/l from firebase.
  clearInputs(input:any[]):void{for(let i of input){i.value = '';}}
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  openModal(){this.modalIsOpen = true}
  closeModal(){this.modalIsOpen = false}
  modalIsOpen:boolean = false;
  setConsole(str:string){this.consoleHistory.unshift(str);console.log(str);}
  consoleHistory:string[] = [];
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  addStudentData:{studentName:string,studentId:string} = {studentName:'',studentId:''};
  setAddStudentName(name:string):void{ this.addStudentData.studentName = name.toLowerCase(); }//set student name
  setAddStudentId(id:string):void{ this.addStudentData.studentId = id.toLowerCase(); }// set student id
  addStudent(StudentData):void//add student record to frebase, only if it does not yet exist. 
  {
    if(StudentData.studentId === '' || StudentData.studentName === ''){return}
    else
    {
    let myStu:student = {studentName: StudentData.studentName,studentId: StudentData.studentId,classes: []};
    this.addStudentToDb(myStu).then((param) => {this.setConsole(param)},(error) => {this.setConsole(error)});
    return;
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  studentAnalytics:number;
  setStudentAnalytics(data:number):void{this.studentAnalytics = data}
  studentAttendenceData:{studentId:string,startDate:Date,endDate:Date} = {studentId: '',startDate:undefined,endDate:undefined} ;//represents student id
  setStudentAttendanceId(id:string){ if(id === '' || !id){return}this.studentAttendenceData.studentId = id; }//set student id
  setStudentAttendanceStartDate(date:string)
  {
    if(date.length < 10){return}
    let dateComponents:string[] = date.split('/');
    console.log("start date values : "+dateComponents);
    this.studentAttendenceData.startDate = new Date(parseInt(dateComponents[2]),parseInt(dateComponents[1])-1,parseInt(dateComponents[0]));
  }
  setStudentAttendanceEndDate(date:string)
  {
    if(date.length < 10){return}
    let dateComponents:string[] = date.split('/');
    this.studentAttendenceData.endDate = new Date(parseInt(dateComponents[2]),parseInt(dateComponents[1])-1,parseInt(dateComponents[0]));
  }

  
  

  getStudentAttendence(student:{studentId:string,startDate:Date,endDate:Date}):void//get student record from firebase and calculate attendence 
  {
    if(student.studentId === ''){return}
      this.getStudentsCollection().then((studentAttendence) => 
      {
        let present:number = 0; 
        let absent:number  = 0; 
        let excused:number = 0;
    
        for(let i = 0; i < studentAttendence.length; i++)
        {
          if(studentAttendence[i].studentId === this.studentAttendenceData.studentId)
          {
            for(let j = 0; j < studentAttendence[i].classes.length; j++)
            {
              for(let k = 0; k < studentAttendence[i].classes[j].attendance.length; k++ )
              {
                if( (new Date(studentAttendence[i].classes[j].attendance[k].date) ) >= this.studentAttendenceData.startDate   && (new Date(studentAttendence[i].classes[j].attendance[k].date)) <= this.studentAttendenceData.endDate)
                {
                  switch(studentAttendence[i].classes[j].attendance[k].state)
                  {
                    case "present":  
                    present += 1; 
                    console.log("found present");
                    break;
               
                    case "absent":  
                    absent += 1;
                    break;
               
                    case "excused":  
                    excused += 1;
                    break; 
                  }
                }
              }
            }
          }
        }
       this.setConsole("from "+this.studentAttendenceData.startDate+" to "+this.studentAttendenceData.startDate+" student "+this.studentAttendenceData.studentId+" was absent "+(absent/(absent+present+excused))+"%" );
      },(err) => this.setConsole("error: "+err) );
     return;
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  studentIds:string[] = [];
  setStudentIds(studentid:string,ref:any)
  {
    if(studentid.length < 10 ){return}
    this.studentIds.unshift(studentid.toLowerCase()); 
    ref.value = '';
  }
  addClassData:any = {instructorEmail:'', className:'',classSection:'',semester:'',studentIds:[]};
  setAddClassName(name:string):void{ this.addClassData.className = name.toLowerCase(); }
  setAddClassSection(section:string):void{ this.addClassData.classSection = section.toLowerCase(); }
  setAddClassEmail(email:string):void{ this.addClassData.instructorEmail = email.toLowerCase(); }
  setAddClassSemester(semester:string):void{ this.addClassData.semester = semester.toLowerCase(); }
  setAddClassStudents(students:string[],input:any):void{ this.addClassData.studentIds = students; this.studentIds = [];}
  //parseStudents(students:string):studentId:string[]{}
  //returns an array of student ids and names from the students input in 'add class'. to do this it relies on regular expressions
  addClass(classdata:any):void//add class record to firebase, only if it does not yet exist. 
  {
    if(classdata.className === '' || classdata.classSection === -1 || classdata.semester === '' || 
    classdata.instructorEmail ===''){return}
    else
    {
      let myClassSection:classSection = {instructorEmail:classdata.instructorEmail,className:classdata.className,semester:classdata.semester,classSection:classdata.classSection,students:[]};
      this.getStudentsCollection()
      .then((students) => {
                            classdata.studentIds.forEach(element => 
                                                { 
                                                  students.forEach(student => {if(student.studentId === element){ myClassSection.students.push({studentName:student.studentName, studentId:element,hasDefaulted:false,attendance:[]})}} );                                               
                                                } );

                           this.addClassToDb(myClassSection).then( (param) => this.setConsole(param),(error) =>this.setConsole(error) );                     
                          }
           );
      return;
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  classAnalytics:number;
  setClassAnalytics(data:number):void{this.classAnalytics = data}
  classAttendenceData:{className:string,section:string,semester:string,startDate:Date,endDate:Date} = {className:'',section:'',semester:'',startDate:undefined,endDate:undefined};
  setClassAttendenceName(name:string):void{if(name === '' || !name){return} this.classAttendenceData.className = name.toLowerCase() }
  setClassAttendenceSection(section:string):void{ if(section === '' || !section){return} this.classAttendenceData.section = section.toLowerCase() }
  setClassAttendanceStartDate(date:string)
  {
    if(date.length < 10){return}
    let dateComponents:string[] = date.split('/');
    this.classAttendenceData.startDate = new Date(parseInt(dateComponents[2]),parseInt(dateComponents[1])-1,parseInt(dateComponents[0]));
  }
  setClassAttendanceEndDate(date:string)
  {
    if(date.length < 10){return}
    let dateComponents:string[] = date.split('/');
    this.classAttendenceData.endDate = new Date(parseInt(dateComponents[2]),parseInt(dateComponents[1])-1,parseInt(dateComponents[0]));
  }
  setClassAttendenceSemester(semester:string):void{if(semester === '' || !semester){return} this.classAttendenceData.semester = semester.toLowerCase() }
  getClassAttendence(attendencedata:any):void//retrieve class record from firebase and compute attendence 
  {
    if(attendencedata.className === '' || attendencedata.section === '' || attendencedata.semester === ''){return}
    else
    {
      let present:number = 0; 
      let absent:number  = 0; 
      let excused:number = 0;

      this.getClassesCollection().then( (myClassAttendence) => 
      {
        for(let i = 0 ; i < myClassAttendence.length; i++)
        {
          if(myClassAttendence[i].className === this.classAttendenceData.className && myClassAttendence[i].classSection === this.classAttendenceData.section && myClassAttendence[i].semester === this.classAttendenceData.semester)
          {
            for(let j = 0 ; j < myClassAttendence[i].students.length ; j++)
            {
              for(let k = 0;k <  myClassAttendence[i].students[j].attendance.length ; k++)
              {
                if( new Date(myClassAttendence[i].students[j].attendance[k].date) >= this.classAttendenceData.startDate && new Date(myClassAttendence[i].students[j].attendance[k].date) <= this.classAttendenceData.endDate)
                {
                  switch(myClassAttendence[i].students[j].attendance[k].state)
                  {
                    case"present":  present += 1; 
                    break;
                    case"absent": absent += 1;
                    break;
                    case"excused": excused += 1;
                    break;
                  }
                }
              } 
            }
          }
        }
       this.setConsole(this.classAttendenceData.className+" "+this.classAttendenceData.section+" "+"present: "+present + " absent: " + absent+ " excused: " + excused);
      },(err) => this.setConsole(err) );
    }
    
  return;
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  addInstructorData:{instructorEmail:string,password:string} = {instructorEmail:'',password:''};
  setAddInstructorEmail(email:string):void{ this.addInstructorData.instructorEmail = email }
  setAddInstructorPassword(password:string):void{ this.addInstructorData.password = password }
  addInstructor(instructor:any):void//add login for instructor using firebase:auth(email+password login account) 
  {
    if(instructor.instructorEmail === '' || instructor.password === ''){return}
    else
    //YOUR CODE HERE............
    return;
  }
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
    catch{ success = false}
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
  
  constructor(){}

  ngAfterViewInit()
  {
    
  }
}
