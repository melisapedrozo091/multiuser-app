import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Unsubscribe,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

export interface FirestoreEnrollment {
  id?: string;              // Firestore document ID
  code: string;             // Display code: INS-2026-001
  userId: string;
  userEmail: string;
  userName: string;
  courseId: number;
  courseName: string;
  price: number;
  currency: string;
  date: string;
  createdAt: any;
  pausedAt?: string | null;
  status: string;
  paymentMethod: string;
  rating?: number;
  reviewComment?: string;
  refundReason?: string;
  deletedFromUi?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService implements OnDestroy {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private unsubscribeEnrollments: Unsubscribe | null = null;

  private enrollmentsSubject = new BehaviorSubject<FirestoreEnrollment[]>([]);
  enrollments$: Observable<FirestoreEnrollment[]> = this.enrollmentsSubject.asObservable();

  private _isConnected = false;

  constructor() {
    this.initFirebase();
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  private initFirebase(): void {
    try {
      // Only initialize if real credentials are configured
      if (
        !environment.firebase ||
        !environment.firebase.apiKey ||
        environment.firebase.apiKey === 'YOUR_FIREBASE_API_KEY' ||
        environment.firebase.apiKey.startsWith('YOUR_')
      ) {
        console.warn('⚠️ Firebase: credenciales no configuradas. Usando datos locales.');
        return;
      }

      this.app = initializeApp(environment.firebase);
      this.db = getFirestore(this.app);
      this._isConnected = true;
      console.log('✅ Firebase Firestore conectado correctamente.');

      // Start real-time listener
      this.listenToEnrollments();
    } catch (error) {
      console.error('❌ Error al inicializar Firebase:', error);
      this._isConnected = false;
    }
  }

  /**
   * Real-time listener on the 'enrollments' collection.
   * Emits every time data changes in Firestore.
   */
  private listenToEnrollments(): void {
    if (!this.db) return;

    const enrollmentsRef = collection(this.db, 'enrollments');
    const q = query(enrollmentsRef, orderBy('createdAt', 'desc'));

    this.unsubscribeEnrollments = onSnapshot(
      q,
      (snapshot) => {
        const enrollments: FirestoreEnrollment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FirestoreEnrollment;
          enrollments.push({ ...data, id: docSnap.id });
        });
        this.enrollmentsSubject.next(enrollments);
        console.log(`🔄 Firestore: ${enrollments.length} inscripciones recibidas en tiempo real.`);
      },
      (error) => {
        console.error('❌ Error en listener de Firestore:', error);
      }
    );
  }

  /**
   * Add a new enrollment to Firestore
   */
  async addEnrollment(enrollment: Omit<FirestoreEnrollment, 'id'>): Promise<string | null> {
    if (!this.db) return null;
    try {
      const enrollmentsRef = collection(this.db, 'enrollments');
      const docRef = await addDoc(enrollmentsRef, {
        ...enrollment,
        createdAt: serverTimestamp()
      });
      console.log('✅ Inscripción guardada en Firestore:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error al guardar en Firestore:', error);
      return null;
    }
  }

  /**
   * Update an enrollment in Firestore
   */
  async updateEnrollment(docId: string, data: Partial<FirestoreEnrollment>): Promise<boolean> {
    if (!this.db) return false;
    try {
      const docRef = doc(this.db, 'enrollments', docId);
      await updateDoc(docRef, { ...data });
      console.log('✅ Inscripción actualizada en Firestore:', docId);
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar en Firestore:', error);
      return false;
    }
  }

  /**
   * Soft-delete an enrollment in Firestore (mark as deleted)
   */
  async softDeleteEnrollment(docId: string): Promise<boolean> {
    return this.updateEnrollment(docId, { deletedFromUi: true, status: 'ELIMINADO' });
  }

  /**
   * Load all enrollments once (non-realtime)
   */
  async loadEnrollmentsOnce(): Promise<FirestoreEnrollment[]> {
    if (!this.db) return [];
    try {
      const enrollmentsRef = collection(this.db, 'enrollments');
      const q = query(enrollmentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const enrollments: FirestoreEnrollment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreEnrollment;
        enrollments.push({ ...data, id: docSnap.id });
      });
      return enrollments;
    } catch (error) {
      console.error('❌ Error al cargar desde Firestore:', error);
      return [];
    }
  }

  /**
   * Seed Firestore with local enrollments (useful for initial migration)
   */
  async seedFromLocal(enrollments: FirestoreEnrollment[]): Promise<void> {
    if (!this.db) return;
    for (const enrollment of enrollments) {
      const { id, ...data } = enrollment;
      await this.addEnrollment(data);
    }
    console.log(`✅ ${enrollments.length} inscripciones migradas a Firestore.`);
  }

  ngOnDestroy(): void {
    if (this.unsubscribeEnrollments) {
      this.unsubscribeEnrollments();
    }
  }
}
