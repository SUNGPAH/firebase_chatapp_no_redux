import React, {useEffect, useState} from 'react';


const Test = () => {
  const [cnt, setCnt] = useState(0);

  const onClick = () => {
    setCnt(prev => prev + 1);
  }

  useEffect(() => {
    console.log('use effect!!!!');
  }, 0)

  return <>gogo

    <br/>
    {cnt}

    <div onClick={onClick}>++</div>
  
  </>

}

export default Test