import firebase_app from "../config";
import { getFirestore, doc, getDoc, collection, getCountFromServer } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function getCount(collec) {

    let result = null;
    let error = null;

    const coll = collection(db, collec);
    try {
        const snapshot = await getCountFromServer(coll);
        result = snapshot.data().count
    } catch (e) {
        error = e;
    }

    return result;
}

        // const collectionRef = collection(db, 'lyrics');
        // const snapshot = await getCountFromServer(collectionRef);
        // count = snapshot.data().count
        // console.log('count: ', snapshot.data().count);