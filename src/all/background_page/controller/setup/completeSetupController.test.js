/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import CompleteSetupController from "./completeSetupController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {withSecurityTokenAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";
import User from "../../model/user";
import Keyring from "../../model/keyring";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import WebIntegration from "../../pagemod/webIntegrationPagemod";
import AuthBootstrap from "../../pagemod/authBootstrapPagemod";
import PublicWebsiteSignIn from "../../pagemod/publicWebsiteSignInPagemod";

jest.mock("../../app");

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("CompleteSetupController", () => {
  describe("CompleteSetupController::exec", () => {
    it("Should complete the setup.", async() => {
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 2}));
      const account = new AccountSetupEntity(withSecurityTokenAccountSetupDto());
      const controller = new CompleteSetupController(null, null, defaultApiClientOptions(), account);

      // Mock API complete request.
      fetch.doMockOnce(() => mockApiResponse());
      // Mock pagemods to assert the complete start the auth and inform menu pagemods.
      WebIntegration.init = jest.fn();
      PublicWebsiteSignIn.init = jest.fn();
      AuthBootstrap.init = jest.fn();

      expect.assertions(12);
      await controller.exec();
      const user = User.getInstance().get();
      expect(user.id).toStrictEqual(account.userId);
      expect(user.username).toStrictEqual(account.username);
      expect(user.firstname).toStrictEqual(account.firstName);
      expect(user.lastname).toStrictEqual(account.lastName);
      expect(user.settings.domain).toStrictEqual(account.domain);
      expect(user.settings.securityToken).toStrictEqual(account.securityToken.toDto());

      const keyring = new Keyring();
      const keyringPrivateKey = await OpenpgpAssertion.readKeyOrFail(keyring.findPrivate().armoredKey);
      const keyringPublicKey = await OpenpgpAssertion.readKeyOrFail(keyring.findPublic(account.userId).armoredKey);
      const accountPrivateKey = await OpenpgpAssertion.readKeyOrFail(account.userPrivateArmoredKey);
      const accountPublicKey = await OpenpgpAssertion.readKeyOrFail(account.userPublicArmoredKey);
      const keyringPrivateFingerprint = keyringPrivateKey.getFingerprint().toUpperCase();
      const accountPrivateFingerprint = accountPrivateKey.getFingerprint().toUpperCase();
      const keyringPublicFingerprint = keyringPublicKey.getFingerprint().toUpperCase();
      const accountPublicFingerprint = accountPublicKey.getFingerprint().toUpperCase();
      expect(keyringPrivateFingerprint).toStrictEqual(accountPrivateFingerprint);
      expect(keyringPublicFingerprint).toStrictEqual(accountPublicFingerprint);
      expect(keyringPublicFingerprint).toStrictEqual(keyringPrivateFingerprint);

      expect(WebIntegration.init).toHaveBeenCalled();
      expect(PublicWebsiteSignIn.init).toHaveBeenCalled();
      expect(AuthBootstrap.init).toHaveBeenCalled();
    });

    it("Should not add the account to the local storage if the complete API request fails.", async() => {
      const account = new AccountSetupEntity(withSecurityTokenAccountSetupDto());
      const controller = new CompleteSetupController(null, null, defaultApiClientOptions(), account);

      // Mock API complete request.
      fetch.doMockOnce(() => Promise.reject());

      const promise = controller.exec();

      expect.assertions(2);
      await expect(promise).rejects.toThrow();
      expect(() => User.getInstance().get()).toThrow("The user is not set");
    });
  });
});
