// ================================================================
// COFFEE CIRCLE — FIREBASE (Firestore) INTEGRATION
// Loaded as an ES module. Requires assets/firebase-config.js to be filled in.
// ================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/** Write a new order to the "orders" collection. Returns the new doc id. */
export async function placeOrder(orderData){
  const ref = await addDoc(collection(db, "orders"), {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp()
  });
  return ref.id;
}

/** Real-time listener — calls callback(orders[]) whenever orders change. Returns an unsubscribe function. */
export function listenOrders(callback){
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap=>{
    const orders = [];
    snap.forEach(d => orders.push({ id: d.id, ...d.data() }));
    callback(orders);
  }, err=>{
    console.error('Firestore listen error:', err);
    callback(null, err);
  });
}

/** Update an order's status (e.g. "pending" -> "fulfilled"). */
export async function setOrderStatus(orderId, status){
  await updateDoc(doc(db, "orders", orderId), { status });
}
