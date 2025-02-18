/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import browser from "../all/background_page/sdk/polyfill/browserPolyfill";
import PortManager from "./sdk/portManager";
import WebNavigationService from "./service/webNavigation/webNavigationService";
import LocalStorageService from "./service/localStorage/localStorageService";
import SystemRequirementService from "./service/systemRequirementService/systemRequirementService";

/**
 * Load all system requirement
 */
SystemRequirementService.get();

/**
 * Add listener on passbolt logout
 */
self.addEventListener("passbolt.auth.after-logout", LocalStorageService.flush);

/**
 * Add listener on startup
 */
browser.runtime.onStartup.addListener(LocalStorageService.flush);

/**
 * Add listener on any on complete navigation
 */
browser.webNavigation.onCompleted.addListener(WebNavigationService.exec);

/**
 * Add listener on connect port
 */
browser.runtime.onConnect.addListener(PortManager.onPortConnect);

/**
 * Add listener on tabs on removed
 */
browser.tabs.onRemoved.addListener(PortManager.onTabRemoved);
