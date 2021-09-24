import handleReceivedEvent from "jsExtension/handleReceivedEvent"
import switchPanel from "jsExtension/switchPanel"
import { getObjCClassDeclar } from "utils/common"
import { InstMethods, clsMethons } from "jsExtension/lifeCycle"
import mnaddon from "../mnaddon.json"

const inst: InstMembers = {
  ...InstMethods,
  ...switchPanel,
  ...handleReceivedEvent,
}

const cls: ClsMembers = {
  ...clsMethons,
}
JSB.newAddon = (mainPath): WrapperObj<any> =>
  JSB.defineClass(getObjCClassDeclar(mnaddon.title, "JSExtension"), inst, cls)
