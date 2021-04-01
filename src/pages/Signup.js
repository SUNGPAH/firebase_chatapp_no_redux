import React, {useState, useEffect} from 'react';
import '../App.css';
import {useHistory} from 'react-router-dom';
import {db, firebaseApp, firebase} from '../firebase';
import Spinner from '../components/Spinner';

const Signup = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickName, setNickName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);
  const [uid, setUid] = useState("");

  const signup = () => {
    if(email.length < 3) {
      alert('!!!');
      return
    }

    setLoading(true);
    firebaseApp.auth().createUserWithEmailAndPassword(email, password)
    .then((user) => {
      const uid = (firebaseApp.auth().currentUser || {}).uid
      console.log(uid); //tngyNVDEKdY6WqpLVTb3BEbTIfZ2

      if(uid){
        db
        .collection('google')
        .add({
          uid: uid,
          nickName: nickName,
          age: 20, 
          email: email,
          created: firebase.firestore.Timestamp.now().seconds
        })
        .then((ref) => {
          setLoginStatus(true);
          setUid(uid);
          setEmail("");
          setPassword("");
          history.push('/createChat')
          setLoading(false);
        })
      }else{
        alert('error');
      }
    })
    .catch((error) => {
      setLoading(false);
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  }

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged((user) => {
      const uid = (firebaseApp.auth().currentUser || {}).uid
      if(uid){
        setLoginStatus(true);
        setUid(uid);
        history.push('/app')
      }else{
      }
    })
  }, [])

  return (
    <div>     
      <Spinner show={loading}/> 
      <div className="flex aic jcc vh100">
        <div className="w400">
          <div className="fdr aic pt16">
            <div className="w100">
              <span>NickName</span>
            </div>
            <input onChange={evt => {setNickName(evt.target.value)}}
              className="default_input f1"
              placeholder="nickname"
              value={nickName}
            />
          </div>

          <div className="fdr aic pt16">
            <div className="w100">
              <span>email</span>
            </div>
            <input onChange={evt => {setEmail(evt.target.value)}}
              className="default_input f1"
              placeholder="email"
              value={email}
            />
          </div>
          <div className="fdr aic pt16">
            <div className="w100">
              <span>password</span>
            </div>
            <input onChange={evt => {setPassword(evt.target.value)}}
              className="default_input f1"
              placeholder="password"
              type="password"
              value={password}
            />
          </div>
          <div className="jcc flex pt16 pb16">
          </div>
          <div onClick={signup} className="btn btn-success btn-fit">
            Signup
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
