import { $name } from "addon"

const eventHandlerController = (
  handlerList: {
    event: string
    handler?: string
  }[]
): {
  add: () => void
  remove: () => void
} => {
  function add() {
    handlerList.forEach(v => {
      if (v.handler)
        NSNotificationCenter.defaultCenter().addObserverSelectorName(
          self,
          `${v.handler}:`,
          v.event
        )
      else
        NSNotificationCenter.defaultCenter().addObserverSelectorName(
          self,
          `on${v.event.replace($name, "")}:`,
          v.event
        )
    })
  }

  function remove() {
    handlerList.forEach(v => {
      NSNotificationCenter.defaultCenter().removeObserverName(self, v.event)
    })
  }

  return { add, remove }
}

export default eventHandlerController
