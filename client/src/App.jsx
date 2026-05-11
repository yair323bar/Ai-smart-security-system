import { useState } from "react";

const loginFields = [
  { id: "username", label: "User name", type: "text" },
  { id: "password", label: "Password", type: "password" }
];

const signupFields = [
  { id: "firstName", label: "First Name", type: "text" },
  { id: "lastName", label: "Last Name", type: "text" },
  { id: "age", label: "Age", type: "number" },
  { id: "email", label: "Gmail", type: "email" },
  { id: "username", label: "User Name", type: "text" },
  { id: "password", label: "Password", type: "password" },
  { id: "confirmPassword", label: "Confirm Password", type: "password" }
];

function AuthField({ field }) {
  return (
    <label className="field-row" htmlFor={field.id}>
      <span>{field.label}</span>
      <input id={field.id} type={field.type} name={field.id} />
    </label>
  );
}

function LoginScreen({ onSwitch }) {
  return (
    <section className="auth-card" aria-labelledby="login-title">
      <div className="auth-card__glow" />
      <div className="auth-card__inner">
        <h1 id="login-title">Login</h1>

        <form className="auth-form">
          {loginFields.map((field) => (
            <AuthField field={field} key={field.id} />
          ))}

          <button className="primary-button" type="button">
            Login
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <button className="text-button" type="button" onClick={onSwitch}>
            Sign up
          </button>
        </p>
      </div>
    </section>
  );
}

function SignupScreen({ onSwitch }) {
  return (
    <section className="auth-card auth-card--wide" aria-labelledby="signup-title">
      <div className="auth-card__glow" />
      <div className="auth-card__inner">
        <h1 id="signup-title">Sign up</h1>

        <form className="auth-form auth-form--signup">
          {signupFields.map((field) => (
            <AuthField field={field} key={field.id} />
          ))}

          <button className="primary-button" type="button">
            Create Account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button className="text-button" type="button" onClick={onSwitch}>
            Back to login
          </button>
        </p>
      </div>
    </section>
  );
}

function App() {
  const [screen, setScreen] = useState("login");

  return (
    <div className="auth-page">
      <div className="background-scene" aria-hidden="true">
        <div className="background-scene__grid" />
        <div className="background-scene__tower background-scene__tower--one" />
        <div className="background-scene__tower background-scene__tower--two" />
        <div className="background-scene__tower background-scene__tower--three" />
        <div className="background-scene__tower background-scene__tower--four" />
      </div>

      {screen === "login" ? (
        <LoginScreen onSwitch={() => setScreen("signup")} />
      ) : (
        <SignupScreen onSwitch={() => setScreen("login")} />
      )}
    </div>
  );
}

export default App;
