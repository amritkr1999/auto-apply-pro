import React from "react";
import "./profile.css";

export const CandidateProfile: React.FC = () => {
  return (
    <section className="profile-root">
      <div className="profile-header">
        <div>
          <h1>Jane Doe</h1>
          <p className="muted">Frontend Engineer — San Francisco, CA</p>
        </div>
        <div>
          <button className="btn">Edit Profile</button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card">
          <h3>About</h3>
          <p>
            Passionate frontend developer with 5+ years building user-friendly
            web apps.
          </p>
        </div>

        <div className="card">
          <h3>Skills</h3>
          <ul>
            <li>React</li>
            <li>TypeScript</li>
            <li>CSS / Tailwind</li>
          </ul>
        </div>

        <div className="card full">
          <h3>Experience</h3>
          <ol>
            <li>Senior Frontend Engineer — Acme (2022 - present)</li>
            <li>Frontend Engineer — Beta LLC (2019 - 2022)</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default CandidateProfile;
