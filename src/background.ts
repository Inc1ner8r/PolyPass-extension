import { get_passwords } from "./polybase";
import {
  CurrentParams,
  GetPasswords,
  Message,
  MessageKey,
  Password,
} from "./types";

const current_params: CurrentParams = {
  password: "",
  username: "",
  website: "",
};

let passwords_for_requested_website: Password[];

chrome.tabs.onUpdated.addListener((id, change, tab) => {
  const change_url = change.url?.replace(/\/+$/, "");

  if (change_url && current_params.website) {
    const url_parsed = new URL(change_url);
    const current_url_parsed = new URL(current_params.website);
    if (
      url_parsed.hostname == current_url_parsed.hostname &&
      change_url != current_params.website &&
      current_params.username &&
      current_params.password
    ) {
      const new_message: Message<any> = {
        key: MessageKey.LOGIN_SUCCESS,
      };

      let exist = passwords_for_requested_website.find((e) => {
        const params_website = new URL(current_params.website).hostname;

        return (
          e.password == current_params.password &&
          e.username == current_params.username &&
          e.website == params_website
        );
      });

      if (exist) return;
      setTimeout(() => {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(tabs?.[0].id ?? 0, new_message);
            current_params.website = "";
            current_params.username = "";
            current_params.password = "";
          }
        );
      }, 300);
    }
  }
});

chrome.runtime.onMessage.addListener((m: Message<any>, _, sendRes) => {
  if (m.key == MessageKey.GET_PASSWORDS) {
    const body = m.body as GetPasswords;
    const passwords = get_passwords();
    passwords_for_requested_website = passwords.filter(
      (e) => e.website == body.domain
    );
    sendRes(passwords_for_requested_website);
    return true;
  }
  if (m.key == MessageKey.PARAMS_UPDATED) {
    const body = m.body as CurrentParams;
    current_params.username = body.username;
    current_params.password = body.password;
    current_params.website = body.website.replace(/\/+$/, "");
    return true;
  }
  return false;
});
