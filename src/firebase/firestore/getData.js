import firebase_app from "../config";
import { getFirestore, doc, getDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";

const db = getFirestore(firebase_app)
export async function getData(colllection, id) {
  let docRef = doc(db, colllection, id);

  let result = null;
  let error = null;

  try {
      result = await getDoc(docRef);
  } catch (e) {
      error = e;
  }

  return result
}

export async function getNotes(colllection, id, colll2, id2){
  let docRef = doc(db, colllection, id, colll2, id2);
  let result = await getDoc(docRef);
  return result
}

export async function getAllDocs(colllection) {
  let docList = []
  const querySnapshot = await getDocs(collection(db, colllection));
  querySnapshot.forEach((doc) => {
    docList.push({id:doc.id, data:Object.keys(doc.data())})
  });
  return docList
}

export async function getAllDocID(colllection) {
  let docList = []
  const querySnapshot = await getDocs(collection(db, colllection));
  querySnapshot.forEach((doc) => {
    docList.push(doc.id)
  });
  return docList
}

// export async function getDocuQuery(colllection, searchfield, searchType, searchVal) {
//   let result = []
//   const q = query(collection(db,colllection), where(searchfield, searchType, searchVal))
//   const unsubscribe = onSnapshot(q, (querySnapshot)=> {
//     const results = []
//     querySnapshot.forEach((doc) => {
//       results.push(doc.data());
//       result.push(doc.data());
//     })
//     // console.log("thi wha we got: ", results)
//   })
//   // const querySnapshot = await getDocs(q)
//   // querySnapshot.forEach((doc) => {
//   //   result.push(doc.data());
//   // })
//   unsubscribe()
//   return result
// }
export async function getDocuQuery(colllection, searchfield, searchType, searchVal) {
  let result = []
  const q = query(collection(db,colllection), where(searchfield, searchType, searchVal))

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    result.push(doc.data());
  })
  return result
}

export function docsQuery(colllection){
  let test = []
  const q = query(collection(db, colllection))
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      test.push({id:doc.id, data:Object.keys(doc.data())});
    })
  })
  return test
}
// export async function docsQuery(colllection, id){
//   const unsub = onSnapshot(doc(db, colllection, id), (doc => {
//     console.log("Current data: ", doc.data())
//   }))
// }