import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

export const useFirebaseAuth = () => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      return {
        idToken: await user.getIdToken(),
        name: user.displayName || '',
        email: user.email,
        photoURL: user.photoURL,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return { signInWithGoogle };
};
