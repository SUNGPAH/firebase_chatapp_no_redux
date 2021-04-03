import React, {useEffect, useState, useRef, useMemo} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {db, firebaseApp, firebase} from '../firebase';
import { BiSend, BiLogOut, BiCommentAdd} from "react-icons/bi";
import ChatCard from '../components/chats/ChatCard';
import {useImmer} from 'use-immer';

const Chats = React.memo(({chats, users, uid, onEmojiClick}) => {
  return <>
    {
    chats.map((chat) => {
      return <div key={chat.id}>
        <ChatCard chat={chat} users={users} uid={uid} index={chat.id} onEmojiClick={onEmojiClick}/>
      </div>
    })
  }</>
}, (prevProps, nextProps) => {
  return (prevProps.chats === nextProps.chats) && 
  (prevProps.users === nextProps.users)
})

const ChatRoomWithImmer = (props) => {
  const history = useHistory();
  const [chats, setChats] = useImmer([]);
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
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newEntry = change.doc.data();
          newEntry.id = change.doc.id
          setChats(draft => {
            draft.push(newEntry);
          })
        }
        if (change.type === "modified") {
          const data = change.doc.data();
          data.id = change.doc.id
          setChats(draft => {
            const index = draft.findIndex(el => el.id === change.doc.id)
            draft[index] = data
          })          
        }
        if (change.type === "removed") {
          console.log("remove message: ", change.doc.data());
        }
      });
    });
  }, [])

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

  const onEmojiClick = (emojiKey, chatId) => {    
    const chatRef = db.collection('chat').doc('room_' + channelId).collection('messages').doc(chatId)
    chatRef.get().then(doc => {
      const data = doc.data()      
      const emojiObj = {...data.emoji};
      let uids = emojiObj[emojiKey];

      if (uids){
        if(uids.includes(uid)){
        }else{
          uids.push(uid)
        }
      }else{
        uids = [uid]
      }

      emojiObj[emojiKey] = uids
      chatRef.update({
        emoji: emojiObj
      })  
    })
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
        <Chats chats={chats} users={users} uid={uid} onEmojiClick={onEmojiClick}/>   
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

export default ChatRoomWithImmer