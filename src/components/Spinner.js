import React from 'react';

const Spinner = ({show}) => {
  return <div className={`posFx vw100 vh100 aic jcc ${show ? "flex":"dNone"}`}>
    <div className="spinner loader">
    </div>
  </div>
}

export default Spinner

