local gpu = component.proxy(component.list('gpu')())
local fs = component.proxy(component.list('filesystem')())

gpu.set(1, 1, 'FileSystem size: ' .. fs.spaceTotal())