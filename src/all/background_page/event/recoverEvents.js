/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
const {RecoverController} = require("../controller/recover/recoverController");

const listen = function (worker) {
  /**
   * The recover controller.
   * @type {RecoverController}
   * @private
   */
  const recoverController = new RecoverController(worker, worker.tab.url);
};
exports.listen = listen;
