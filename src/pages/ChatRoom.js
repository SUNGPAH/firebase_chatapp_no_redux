import React, {useEffect, useState, useRef} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {db, firebaseApp, firebase} from '../firebase';
import { BiSend, BiLogOut, BiCommentAdd} from "react-icons/bi";
import ChatCard from '../components/chats/ChatCard';

const Chats = React.memo(({chats, users}) => {
  console.log('chats rendering');
  return <>
    {
    chats.map((chat) => {
      return <div key={chat.id}>
        <ChatCard chat={chat} users={users} index={chat.id} />
      </div>
    })
  }</>
}, (prevProps, nextProps) => {
  return (prevProps.chats === nextProps.chats)
})

const ChatRoom = (props) => {
  const history = useHistory();
  const [chats, setChats] = useState([]);
  const [tempChats, setTempChats] = useState([]);
  const [uid, setUid] = useState("");
  const [chatContent, setChatContent] = useState("");
  const [users, setUsers] = useState({});
  const { channelId } = useParams();
  const messagesEndRef = useRef(null)

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged((user) => {
      const uid = (firebaseApp.auth().currentUser || {}).uid
      if(uid){
        setUid(uid);
      }else{
        window.location = "/login"
      }
    })
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chats]);

  const addDocument = () => {
    db
      .collection('chat')
      .doc('room_' + channelId)
      .collection('messages')
      .add({
        uid: uid,
        content: chatContent,
        created: firebase.firestore.Timestamp.now().seconds
      })
      .then((ref) => {
        setChatContent('');
      })
  }

  useEffect(() => {
    const chatRef = db.collection('chat').doc('room_' + channelId).collection('messages')
    chatRef.orderBy("created").onSnapshot((snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTempChats(data);
    })
  }, [])

  useEffect(() => {
    if(tempChats.length > 0){
      if (tempChats.length === chats.length){
        return ;
      }

      let newEntries = tempChats.filter(x => !chats.map(chat => chat.id).includes(x.id));
      setChats([...chats, ...newEntries]);
    }
  }, [tempChats, chats])

  useEffect(() => {
    if(chats.length === 0){
      return ;
    }

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    const uids = chats.map((chat) => {
      return chat.uid
    }).filter(onlyUnique)

    var usersRef = db.collection("user");
    var arr = {};
    usersRef.where("uid", 'in',  uids).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        arr[data.uid] = data;
      })
      setUsers(arr);
    });  
  }, [chats])

  const onTextareaChange = (evt) => {
    setChatContent(evt.target.value);
  }

  const logout = () => {
    firebaseApp.auth().signOut().then(() => {
      history.push('/login');
    })
  }

  const createChatRoom = () => {
    history.push('/createChat');
  }

  return <div style={{position:'relative'}} className="vh100">
    <div className="flex fdr vh100">
      <div className="w200 bg_black p16">
        <div className="color_white flex fdr aic cursor_pointer" onClick={evt => {logout()}}>
          <BiLogOut/>
          <span className="color_white pl8">Logout</span>
        </div>
        <div className="color_white flex fdr aic cursor_pointer pt16" onClick={evt => {createChatRoom()}}>
          <BiCommentAdd/>
          <span className="color_white pl8">Create New Channel</span>
        </div>
      </div>
      <div className="f1 pl16 pt16 pr">
        <div style={{height: 'calc(100% - 50px)', overflowY:'scroll', paddingBottom:50,}}>
        <Chats chats={chats} users={users}/>   
        <div style={{ float:"left", clear: "both" }}
          ref={messagesEndRef}>
        </div>
        </div>
        <div className="posAb" style={{bottom:16, width:'calc(100% - 32px)', backgroundColor:'#dcdcdc',}}>
          <div className="flex fdr">   
            <textarea className="default_textarea f1 p8" 
            placeholder="send a message to this channel"
            value={chatContent} onChange={evt => {onTextareaChange(evt)}}></textarea>
          </div>
          <div className="flex jce fdr">
            <div className="btn btn-success h40 w40" onClick={evt => addDocument()}><BiSend /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
}

export default ChatRoom