import { useEffect, useState } from 'react';
import { useNavigate } from "react-router";

export default () => {

  const [ctrlKeyPressed, setCtrlKeyPressed] = useState(false);
  const [isMac, setIsMac] = useState(false)
  const key = isMac ? 'metaKey' : 'ctrlKey'
  const handleKeyDown = e => {
    if (e[key]) {
      setCtrlKeyPressed(true);
    }
  };

  const handleKeyUp = e => {
    if (!e[key]) {
      setCtrlKeyPressed(false);
    }
  };

  const navigate = useNavigate();

  let ctrlHistory = Object.assign({}, navigate, {
    push: (value) => {
      if (ctrlKeyPressed) {
        window.open(value, "_blank");
      } else {
        navigate(value);
      }
    }
  });

  useEffect(() => {
    setIsMac(window.navigator.appVersion.toLowerCase().includes('mac'))
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleKeyUp);
    };
  }, [isMac, handleKeyDown, handleKeyUp]);

  return ctrlHistory;
};