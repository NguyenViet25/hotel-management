import logo from "../../assets/logo.png";

export default function Logo() {
  return (
    <img
      width={50}
      height={50}
      style={{ objectFit: "contain" }}
      src={logo}
      alt="logo"
    />
  );
}
