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
 * @since         4.0.0
 */
import {Worker as worker} from "../../model/worker";
import PortManager from "../../../../chrome-mv3/sdk/portManager";
import WorkerService from "./workerService";
import BrowserTabService from "../ui/browserTab.service";
import WorkersSessionStorage from "../../../../chrome-mv3/service/sessionStorage/workersSessionStorage";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import browser from "../../sdk/polyfill/browserPolyfill";
import Worker from "../../sdk/worker";
import WorkerEntity from "../../model/entity/worker/workerEntity";


describe("WorkerService", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  describe("WorkerService::get", () => {
    it("Should get worker from manifest v2", async() => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 2}));
      jest.spyOn(worker, "get").mockImplementationOnce(jest.fn());
      // process
      await WorkerService.get("ApplicationName", 1);
      // expectations
      expect(worker.get).toHaveBeenCalledWith("ApplicationName", 1, true);
    });

    it("Should get worker from manifest v3", async() => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker();
      const port = {
        _name: worker.id,
        _port: {
          sender: {
            tab: {}
          }
        }
      };
      // mock functions
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 3}));
      jest.spyOn(WorkersSessionStorage, 'getWorkersByNameAndTabId').mockImplementationOnce(() => [worker]);
      jest.spyOn(BrowserTabService, "sendMessage").mockImplementationOnce(() => jest.fn());
      jest.spyOn(PortManager, "getPortById").mockImplementationOnce(() => port);
      // process
      const workerResult = await WorkerService.get("ApplicationName", 1);
      // expectations
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(worker, "passbolt.port.connect", worker.id);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(workerResult).toStrictEqual({port: port, tab: port._port.sender.tab});
    });

    it("Should get no worker from manifest v3", async() => {
      expect.assertions(3);
      // mock functions
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 3}));
      jest.spyOn(WorkersSessionStorage, 'getWorkersByNameAndTabId').mockImplementationOnce(() => []);
      jest.spyOn(BrowserTabService, "sendMessage");
      jest.spyOn(PortManager, "getPortById");
      // process
      try {
        await WorkerService.get("ApplicationName", 1);
      } catch (error) {
        // expectations
        expect(BrowserTabService.sendMessage).not.toHaveBeenCalled();
        expect(PortManager.getPortById).not.toHaveBeenCalled();
        expect(error).toStrictEqual(new Error("Could not find worker ApplicationName for tab 1."));
      }
    });
  });

  describe("WorkerService::waitExists", () => {
    it("should wait for the worker exists from manifest v2", async() => {
      expect.assertions(10);
      // mock functions
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementation(() => ({manifest_version: 2}));
      const spy = jest.spyOn(WorkerService, "waitExists");
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");

      expect(spy).not.toHaveBeenCalled();

      WorkerService.waitExists("QuickAccess", 100);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);

      const tab = {
        id: 100,
        url: "https://localhost"
      };
      const port = {
        onMessage: {
          addListener: jest.fn()
        }
      };
      worker.add("QuickAccess", new Worker(port, tab));
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(2);
    });

    it("should wait for the worker exists from manifest v3", async() => {
      expect.assertions(10);
      // data mocked
      const worker = readWorker({name: "QuickAccess"});
      const port = {
        _name: worker.id,
        _port: {
          sender: {
            tab: worker.tabId
          }
        }
      };
      // mock functions
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementation(() => ({manifest_version: 3}));
      jest.spyOn(PortManager, "getPortById").mockImplementation(() => port);
      const spy = jest.spyOn(WorkerService, "waitExists");
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");

      expect(spy).not.toHaveBeenCalled();

      WorkerService.waitExists("QuickAccess", worker.tabId);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(100);
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(1);



      jest.advanceTimersByTime(100);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(2);
    });

    it("should raise an error if the worker not exists until timeout", async() => {
      expect.assertions(8);
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementation(() => ({manifest_version: 3}));
      const spy = jest.spyOn(WorkerService, "waitExists");
      jest.spyOn(WorkerService, "get").mockImplementation(() => { throw new Error("Could not find worker ID QuickAccess for tab 1."); });
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");

      expect(spy).not.toHaveBeenCalled();

      WorkerService.waitExists("QuickAccess", 1).catch(error => {
        expect(error.message).toBe("Could not find worker ID QuickAccess for tab 1.");
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(20000);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(100);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(100);
    });
  });
});
