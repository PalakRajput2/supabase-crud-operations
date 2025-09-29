import React from 'react'

const Footer = () => {
  return (
    <div>
           <footer 
        className="text-center py-3" 
        style={{ 
          backgroundColor: "#343a40", 
          color: "white", 
          position: "fixed", 
          bottom: 0, 
          left: 0, 
          width: "100%" 
        }}
      >
        <p className="mb-0">&copy; {new Date().getFullYear()} SupaNext. All Rights Reserved.</p>
      </footer>
    </div>
  )
}

export default Footer