import firebase_app from "../config";
import { getFirestore, doc, setDoc, writeBatch, arrayUnion } from "firebase/firestore";

const db = getFirestore(firebase_app)
export async function addData(colllection, id, data) {
    let result = null;
    let error = null;

    try {
        result = await setDoc(doc(db, colllection, id), data, {
            merge: true,
        });
    } catch (e) {
        error = e;
    }

    return { result, error };
}

export async function createDoc(colllection, id, data) {
    const response = await setDoc(doc(db, colllection, id), data,{merge: true})
    return response
}

export async function createMultiDocs(list, songName, artistName, oldList) {
  const batch = writeBatch(db);
  list.forEach(element => {
    const ref = doc(db, "kanji", element.kanji);
    batch.set(ref, {'kanji':element.kanji, 'jlpt':element.jlpt, 'kunyomi': element.kun, 'onyomi':element.onr, 'meaning':element.meaning, 'bl':false, 'songRef':[`${songName} by ${artistName}`]});
  });
  oldList.forEach(element => {
    const ref2 = doc(db, "kanji", element);
    batch.update(ref2, {'songRef': arrayUnion(`${songName} by ${artistName}`)},)
  });
  
  await batch.commit();
}