local gpu = component.proxy(component.list('gpu')())

gpu.set(1, 1, "Press the keys Z - M on your keyboard")

local codes = {
    [90] = 800,
    [88] = 1000, 
    [67] = 1200, 
    [86] = 1400, 
    [66] = 1600, 
    [78] = 1800, 
    [77] = 2000
}

local x = 1
while true do
    local event, key, keyCode = computer.pullSignal()

    if event == "key_down" then
        if codes[keyCode] then
            computer.beep(codes[keyCode], 0.1)
        end
    end
end