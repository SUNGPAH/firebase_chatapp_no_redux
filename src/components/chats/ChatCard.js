import React from 'react';

const ChatCard = React.memo(({chat, users, index}) => {
  console.log('chat card rendering');
  console.log(index);

  const who = () => {
    const user = users[chat.uid]
    if (user){
      return user.nickName
    }else{
      return null
    }
  } 

  return <div className="flex fdr pb16" key={index}>
    <div className="w40 h40 flex aic jcc">
      <img src="http://www.gravatar.com/avatar/3b3be63a4c2a439b013787725dfce802?d=identicon"
        className="w30 h30"/>
    </div>
    <div className="pl16 f1">
      <div>
        <span className="bold">{who()}</span>
        <span className="fs color_gray pl8">1:39pm</span>
      </div>
      <div className="pt8">
        {chat.content}
      </div>
    </div>    
  </div>
}, (prevProps, nextProps) => {
  // console.log('chat card');
  // console.log((prevProps.chat === nextProps.chat) && (prevProps.users === nextProps.users))
  return (prevProps.chat === nextProps.chat) && (prevProps.users === nextProps.users)
});

export default ChatCard