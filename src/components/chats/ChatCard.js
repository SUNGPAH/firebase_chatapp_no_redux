import React from 'react';

const ChatCard = React.memo(({chat, users, index, uid, onEmojiClick}) => {
  const who = () => {
    const user = users[chat.uid]
    if (user){
      return user.nickName
    }else{
      return "noname"
    }
  } 

  const renderEmojiSection = () => {
    const emojiObj = chat.emoji
    return <>
      <div className="fdr">
        <EmojiButton emojiKey={'1'} emojiValue={"😎"} emojiObj={emojiObj}/>
        <EmojiButton emojiKey={'2'} emojiValue={"🤣"} emojiObj={emojiObj}/>
      </div>  
    </>
  }

  const EmojiButton = ({emojiKey, emojiValue, emojiObj}) => {
    let extraClassName = ""
    if(emojiObj && emojiObj[emojiKey]){
      if(emojiObj[emojiKey].includes(uid)){
        extraClassName = "active"
      }
    }

    return <div>
      <div onClick={e=> onEmojiClick(emojiKey, chat.id)} className={`emojiRec flex fdr aic ${extraClassName}`}>
        <span>{emojiValue}</span>
        <span>
          {emojiObj && emojiObj[emojiKey] &&
            <div>{emojiObj[emojiKey].length}</div>
          }
        </span>
      </div>
    </div>
  }

  return <div className="flex fdr pb16 chat_card" key={index}>
    <div className="w40 h40 flex aic jcc">
      <img src="http://www.gravatar.com/avatar/3b3be63a4c2a439b013787725dfce802?d=identicon"
        className="w30 h30"/>
    </div>
    <div className="pl16 f1">
      <div>
        <span className="bold">{who()}</span>
        <span className="fs color_gray pl8">-?</span>
      </div>
      <div className="pt8">
        {chat.content}
      </div>
      {renderEmojiSection()}
    </div>    
  </div>
}, (prevProps, nextProps) => {
  // console.log('chat card');
  // console.log((prevProps.chat === nextProps.chat) && (prevProps.users === nextProps.users))
  return (prevProps.chat === nextProps.chat) && (prevProps.users === nextProps.users)
});

export default ChatCard