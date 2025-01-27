import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

const Redirect = ({href}) => {
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    useEffect(() => {
      setIsMounted(true);
    }, []);
    
    useEffect(() => {
      if (isMounted) {
        router.push(href);
      }
    }, [isMounted]);
    return null;
}
export default Redirect;