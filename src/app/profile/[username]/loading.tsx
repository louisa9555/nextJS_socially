import React from 'react'

function loading() {
  return (
    <div className="flex items-center space-x-2">
      <div className="spinner-border inline-block w-4 h-4 border-4 rounded-full" role="status">
        <span className="visually-hidden"></span>
      </div>
      <div>Loading... we're fetching your profile</div>
    </div>
  )
}

export default loading