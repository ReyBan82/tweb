/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import appImManager from '../../lib/appManagers/appImManager';
import rootScope from '../../lib/rootScope';
import {toastNew} from '../toast';
import PopupPickUser from './pickUser';

export default class PopupForward extends PopupPickUser {
  constructor(
    peerIdMids?: {[fromPeerId: PeerId]: number[]},
    onSelect?: (peerId: PeerId) => Promise<void> | void
  ) {
    super({
      peerTypes: ['dialogs', 'contacts'],
      onSelect: !peerIdMids && onSelect ? onSelect : async(peerId) => {
        if(onSelect) {
          const res = onSelect(peerId);
          if(res instanceof Promise) {
            await res;
          }
        }

        if(peerId === rootScope.myId) {
          let count = 0;
          for(const fromPeerId in peerIdMids) {
            const mids = peerIdMids[fromPeerId];
            count += mids.length;
            this.managers.appMessagesManager.forwardMessages(peerId, fromPeerId.toPeerId(), mids);
          }

          toastNew({
            langPackKey: count > 0 ? 'FwdMessagesToSavedMessages' : 'FwdMessageToSavedMessages'
          });

          return;
        }

        appImManager.setInnerPeer({peerId});
        appImManager.chat.input.initMessagesForward(peerIdMids);
      },
      placeholder: 'ShareModal.Search.ForwardPlaceholder',
      chatRightsAction: 'send_messages',
      selfPresence: 'ChatYourSelf'
    });
  }
}
