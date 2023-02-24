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
 * @since         3.8.0
 */
import Pagemod from "./pagemod";
import WorkersSessionStorage from "../service/sessionStorage/workersSessionStorage";
import ScriptExecution from "../../all/background_page/sdk/scriptExecution";
import WorkerEntity from "../../all/background_page/model/entity/worker/workerEntity";

const spyAddWorker = jest.spyOn(WorkersSessionStorage, "addWorker");
jest.spyOn(ScriptExecution.prototype, "injectPortname").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectCss").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectJs").mockImplementation(jest.fn());

describe("Pagemod", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("Pagemod default behavior", () => {
    it("Should create a page mod and inject file with events", async() => {
      expect.assertions(10);
      // process
      const pagemod = new Pagemod("name");
      await pagemod.injectFiles(1, 0);
      const port = {
        _port: {
          sender: {
            tab: 1
          }
        }
      };
      await pagemod.attachEvents(port);
      // expectations
      expect(spyAddWorker).toHaveBeenCalledWith(expect.any(WorkerEntity));
      expect(spyAddWorker).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectPortname).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectCss).toHaveBeenCalledWith(pagemod.contentStyleFiles);
      expect(ScriptExecution.prototype.injectJs).toHaveBeenCalledWith(pagemod.contentScriptFiles);
      expect(pagemod.name).toBe("name");
      expect(pagemod.contentStyleFiles).toStrictEqual([]);
      expect(pagemod.contentScriptFiles).toStrictEqual([]);
      expect(pagemod.events).toStrictEqual([]);
      expect(await pagemod.canBeAttachedTo({})).toBeFalsy();
    });
  });
});
