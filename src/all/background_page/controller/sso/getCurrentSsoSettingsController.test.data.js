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
 * @since         3.9.0
 */
import {v4 as uuid} from "uuid";

export function defaultEmptySettings(data = {}) {
  const defaultData = {
    provider: null,
    data: null,
    providers: ["azure"]
  };

  return {
    ...defaultData,
    ...data
  };
}

export function withAzureSsoSettings(data = {}) {
  const defaultData = defaultEmptySettings({
    id: uuid(),
    status: "active",
    provider: "azure",
    data: {
      url: "https://login.microsoftonline.com/..",
      tenant_id: "5n6p8r9s-m5n6-6p7q-3k5n-8r9s3k4m5n7q",
      client_id: "f2j3m5n6-c3k4-m5p7-x2j4-y2k4m5n7q8r9",
      client_secret: "u8x!A%D*G-KaPdSgVkYp3s6v9y$B?E..",
      client_secret_expiry: "2022-11-02",
    },
    created_by: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    modified_by: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    created: "2022-11-24T09:14:13+00:00",
    modified: "2022-11-24T09:14:13+00:00",
  });

  return {
    ...defaultData,
    ...data
  };
}
