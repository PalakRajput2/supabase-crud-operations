
import React from 'react'


const HomePage = () => {
  return (
   
    <div>
     
      <div className=" container text-center py-5 mb-5"> 
      
        <header className="mb-5">
          <h1 className="display-4 fw-bold">Welcome to SupaNext</h1>
          <p className="lead">A powerful Next.js application with Supabase integration</p>
          <button className="btn btn-primary btn-lg">Get Started</button>
        </header>

        <section className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Fast & Secure</h5>
                <p className="card-text">Built with Next.js and Supabase for speed and security.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Authentication</h5>
                <p className="card-text">Seamless user authentication with Google, GitHub, and more.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Database & Storage</h5>
                <p className="card-text">Manage data effortlessly with Supabases PostgreSQL and storage.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

     
   
    </div>
  )
}

export default HomePage
