import {
  CurrentParams,
  GetPasswordRes,
  GetPasswords,
  Message,
  MessageKey,
} from "./types";

let tried = false;
const v = "1.0";
console.log("Starting Poly Pass", v);
const success_save = document.createElement("div");
success_save.innerHTML = `
<div style="
position:fixed;
top:4%;
left:4%;
border-radius:12px;
padding:16px;
color:black;
background-color:white;
z-index:9999;
-webkit-box-shadow: 10px 10px 88px -8px rgba(0,0,0,1);
-moz-box-shadow: 10px 10px 88px -8px rgba(0,0,0,1);
box-shadow: 10px 10px 88px -8px rgba(0,0,0,1);
">
 Save to passwords? 
 <div>
 <button id="btn_yes" style="
 margin: 3px 5px 3px 0;
 padding: 5px 10px;
 background-color: rgba(164, 229, 157, 255);
 border-radius: 8px;
 border: 2px solid rgba(164, 229, 157, 255);
 color: rgba(44, 136, 33, 255);
 cursor: pointer;">
 Yes</button>
 <button id="btn_no" style="
 margin: 3px 5px 3px 0;
 padding: 5px 10px;
 border-radius: 6px;
 border: none;
 color: rgba(83, 169, 71, 255);
 background: none;
 cursor: pointer;
 ">
 No</button>
 </div>
 </div>`;
chrome.runtime.onMessage.addListener((m: Message<any>, sender) => {
  if (m.key == MessageKey.LOGIN_SUCCESS) {
    document.getElementsByTagName("body")[0].appendChild(success_save);

    document.getElementById("btn_yes")?.addEventListener("click", async () => {
      const new_msg: Message<any> = {
        key: MessageKey.SAVE_PASSWORD,
      };
      await chrome.runtime.sendMessage(new_msg);
      success_save.remove();
    });
    document.getElementById("btn_no")?.addEventListener("click", () => {
      success_save.remove();
    });
  }
});

const on_load = () => {
  const username_element: HTMLInputElement | null =
    document.querySelector("input#email") ||
    document.querySelector("input#loginUsername") ||
    document.querySelector('input[name="email"]') ||
    document.querySelector('input[type="email"]') ||
    document.querySelector('input[name="username"]') ||
    document.querySelector('input[name="userid"]') ||
    document.querySelector('input[name="login"]') ||
    document.querySelector("input#username") ||
    document.querySelector("input#userid") ||
    document.querySelector('input[autocomplete="username"]');

  const password_element: HTMLInputElement | null =
    document.querySelector("input#password") ||
    document.querySelector("input#loginPassword") ||
    document.querySelector('input[type="password"]') ||
    document.querySelector('input[name="password"]') ||
    document.querySelector('input[autocomplete="password"]');
  let username_value = "";
  let password_value = "";

  const update_inputs = (e: Event) => {
    console.log("values updated");

    username_value = username_element?.value ?? "";
    password_value = password_element?.value ?? "";
    const new_msg: Message<CurrentParams> = {
      key: MessageKey.PARAMS_UPDATED,
      body: {
        username: username_value,
        password: password_value,
        website: location.href,
      },
    };

    chrome.runtime.sendMessage(new_msg);
  };
  password_element?.addEventListener("change", update_inputs);
  password_element?.addEventListener("focus", update_inputs);
  password_element?.addEventListener("keypress", update_inputs);
  username_element?.addEventListener("change", update_inputs);
  username_element?.addEventListener("focus", update_inputs);
  username_element?.addEventListener("keypress", update_inputs);
  if (!username_element) {
    if (!tried) {
      tried = true;
      setTimeout(on_load, 2000);
    }
    return;
  }
  const input_height = username_element?.clientHeight;
  const new_msg: Message<GetPasswords> = {
    key: MessageKey.GET_PASSWORDS,
    body: {
      domain: new URL(location.href).hostname,
    },
  };
  chrome.runtime.sendMessage(new_msg, (res: GetPasswordRes) => {
    if (!res) {
      return;
    }
    const passwords = res;
    const list_str = passwords
      .map((e) => `<div class="usernames" style="padding:12px 8px; border:1px solid black;" id="${e.password}"> ${e.username} </div>`)
      .join(" ");

    const drop_down_element = document.createElement("div");
    drop_down_element.innerHTML = `
    <div style="
    display:none;
    position:fixed;
    top:10%;
    left:4%;  
    cursor:pointer;
    color:black;
    background-color: #eeeeee;
    z-index: 9999;
    border-radius: 10px;
">
   ${list_str} </div>`;
    if (!input_height) return;
    if (!passwords.length) return;
    const drop_down_btn_element = document.createElement("div");
    drop_down_btn_element.innerHTML = `
    <div style="
    display:inline;
    position:fixed;
    top:4%;
    left:4%;
    z-index:9999;
    background-color:white;
    -webkit-box-shadow: 10px 10px 88px -8px rgba(0,0,0,1);
    -moz-box-shadow: 10px 10px 88px -8px rgba(0,0,0,1);
    box-shadow: 10px 10px 88px -8px rgba(0,0,0,1);
     border-radius:12px;
     padding:16px;
     color:black;
     cursor: pointer;
     ">View login</div>`;
    document.getElementsByTagName("body")[0].appendChild(drop_down_btn_element);
    document.getElementsByTagName("body")[0].appendChild(drop_down_element);

    drop_down_btn_element.onclick = () => {
      const _ele = drop_down_element.firstElementChild as HTMLElement;
      if (_ele?.style.display == "none") _ele.style.display = "block";
      else _ele.style.display = "none";
    };
    const usernames_element = document.getElementsByClassName("usernames");

    for (let index = 0; index < passwords.length; index++) {
      const username_hint_ele = usernames_element.item(
        index
      ) as HTMLButtonElement;

      username_hint_ele?.addEventListener("click", (e) => {
        const pass = username_hint_ele.id;
        const username = username_hint_ele.innerText;
        username_element.value = username;
        if (password_element) password_element.value = pass;
      });
    }
  });
};

window.onload = () => {
  setTimeout(on_load, 100);
};
