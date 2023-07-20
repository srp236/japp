import firebase_app from "../config";
import { getFirestore, doc, setDoc,addDoc, writeBatch, arrayUnion, updateDoc, arrayRemove } from "firebase/firestore";
import { getAllDocID } from "./getData";

const db = getFirestore(firebase_app)
export async function addData(colllection, id, data) {
  let result = null;
  let error = null;

  try {
      result = await setDoc(doc(db, colllection, id), data, {merge: true});
  } catch (e) {
      error = e;
  }

  return { result, error };
}

export async function addNote(colllection, id, colll2, id2, data){
  await setDoc(doc(db,colllection, id, colll2, id2), data, {merge:true});
  // const messageRef = doc(db, "rooms", "roomA", "messages", "message1");
}

export async function updateData(colllection, id, ref, data){
  try {
    await updateDoc(doc(db, colllection, id), {[ref]:data})
  } catch (error) {
    console.log('there was an error :(')
    console.log(error)
  }
}

export async function updateNoteArray(colllection, id, data1, data2, data3, type) {
    let result = null;
    let error = null;
    console.log(id)
    try {
      type == 'add'?result = await updateDoc(doc(db, colllection, id), {[data1]:arrayUnion(data2)}):
      result = await setDoc(doc(db, colllection, id), {[data1.data2]:arrayRemove(data3)},{merge: true})
      // result = await setDoc(doc(db, colllection, id), {[data1]:{[data2]:arrayRemove(data3)}},{merge: true})
      // result = await updateDoc(doc(db, colllection, id), {[data1]:{[data2]:arrayRemove(data3)}})
    } catch (e) {
        error = e;
        console.log(error)
    }
    return { result, error };
}

export async function updateDataArray(colllection, id, data1, data2, type) {
    let result = null;
    let error = null;
    console.log(id)
    try {
      type == 'add'?result = await updateDoc(doc(db, colllection, id), {[data1]:arrayUnion(data2)}):
      result = await updateDoc(doc(db, colllection, id), {[data1]:arrayRemove(data2)})
    } catch (e) {
        error = e;
        console.log(error)
    }
    return { result, error };
}

export async function updateMultiDocs(colllection, list, field, data){
  const batch = writeBatch(db);
  list.forEach(element => {
    const ref = doc(db, colllection, element.kanji);
    batch.update(ref, {[field]: data})
  });
  await batch.commit();
}

export async function updateMultiNotes(colllection,id,data, list){
  const batch = writeBatch(db);
  list.forEach(element => {
    const ref = doc(db, colllection, id);
    batch.set(ref, {[element.id.id]: {[data]: {[element.strt]:element.strtVal, [element.end]:element.endVal}}},{merge:true})
    // batch.update(ref, {[element.id.id]: {[data]: {[element.end]:element.endVal}}})
  });
  await batch.commit();
}

export async function createDoc(colllection, id, data) {
    const response = await setDoc(doc(db, colllection, id), data,{merge: true})
    return response;
}

export async function createMultiDocs(list, songName, artistName, oldList) {
  const batch = writeBatch(db);
  var idx = (await getAllDocID('kanji')).length
  if(songName == null & artistName == null){
    list.forEach(element => {
      const ref3 = doc(db, "kanji", element.kanji);
      // batch.set(ref3, {test:'test'}) //why?? 
      batch.set(ref3, {'kanji':element.kanji, 'jlpt':element.jlpt, 'kunyomi': element.kunyomi, 'onyomi':element.onyomi, 'meaning':element.meaning, 'bl':false, 'songRef':[], 'tags':[], key:idx});
      idx++
    });
  } else {
    list.forEach(element => {
      const ref = doc(db, "kanji", element.kanji);
      batch.set(ref, {'kanji':element.kanji, 'jlpt':element.jlpt, 'kunyomi': element.kun, 'onyomi':element.onr, 'meaning':element.meaning, 'bl':false, 'songRef':[`${songName} by ${artistName}`], 'tags':[], 'key':idx});
      idx++
    });
    oldList.forEach(element => {
      const ref2 = doc(db, "kanji", element);
      batch.update(ref2, {'songRef': arrayUnion(`${songName} by ${artistName}`)},)
    });
  }
  await batch.commit();
}