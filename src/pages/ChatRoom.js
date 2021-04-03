import React, {useEffect, useState, useRef, useMemo} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {db, firebaseApp, firebase} from '../firebase';
import { BiSend, BiLogOut, BiCommentAdd} from "react-icons/bi";
import ChatCard from '../components/chats/ChatCard';

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

const ChatRoom = (props) => {
  const history = useHistory();
  const [chats, setChats] = useState([]);
  const [uid, setUid] = useState("");
  const [chatContent, setChatContent] = useState("");
  const [users, setUsers] = useState({});
  const { channelId } = useParams();
  const messagesEndRef = useRef(null)
  const [modifyCandidate, setModifyCandidate] = useState(null);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");

  const onClick = () => {
    setSearch(text);
  }

  const memoizedText = useMemo(() => {
    console.log('use memo');
    //이때 다 가져옴. 즉, search가 바뀔 때에, 현재 있는 스테이트들 다 가져와서 바꾼다는 말.
    return <div>{text} - {search}</div>
  }, [search])

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
    chatRef.orderBy("created").get().then((snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(data);
    })
  }, [])

  useEffect(() => {
    const chatRef = db.collection('chat').doc('room_' + channelId).collection('messages')
    chatRef.orderBy("created").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newEntry = change.doc.data();
          newEntry.id = change.doc.id
          setModifyCandidate(newEntry); 
        }
        if (change.type === "modified") {
          const data = change.doc.data();
          data.id = change.doc.id
          setModifyCandidate(data);  
        }
        if (change.type === "removed") {
          console.log("remove message: ", change.doc.data());
        }
      });
    });
  }, [])

  const chatRecords = useMemo(() => {
    //this part will only be refreshed when modifyCandidate is set.
    console.log('chat records use memo');
    if(!modifyCandidate){
      return chats
    }

    const copied = [...chats];
    const index = copied.findIndex(chat => chat.id === modifyCandidate.id)
    if(index === -1) {
      copied.push(modifyCandidate)
    } else {
      modifyCandidate.id = copied[index].id
      copied[index] = modifyCandidate
    }
    setChats(copied) 
    return copied
  }, [modifyCandidate])

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

    <input value={text} onChange={evt => {setText(evt.target.value)}}/>

    <div onClick={onClick}>??????</div>

    <hr/>

    {memoizedText}

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
        <Chats chats={chatRecords} users={users} uid={uid} onEmojiClick={onEmojiClick}/>   
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