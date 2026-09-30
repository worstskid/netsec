local Players = game:GetService("Players")
local me = Players.LocalPlayer
local charFolder = workspace:WaitForChild("characters")
local playerGui = me:WaitForChild("PlayerGui")
local highlights = {}
local links = {}
local plateFrame = nil

local function findPlateFrame()
    local usernames = {}
    for _, plr in ipairs(Players:GetPlayers()) do usernames[plr.Name] = true end
    for _, sg in ipairs(playerGui:GetChildren()) do
        if sg:IsA("ScreenGui") and string.find(sg.Name, "{", 1, true) then
            for _, frame in ipairs(sg:GetChildren()) do
                if frame:IsA("Frame") then
                    local matchCount = 0
                    for _, c in ipairs(frame:GetChildren()) do
                        if c:IsA("Frame") and usernames[c.Name] then
                            matchCount = matchCount + 1
                        end
                    end
                    if matchCount >= 1 then return frame end
                end
            end
        end
    end
    return nil
end

local function getPlateData()
    local live, all = {}, {}
    if not plateFrame or not plateFrame.Parent then
        plateFrame = findPlateFrame()
    end
    if plateFrame then
        for _, plate in ipairs(plateFrame:GetChildren()) do
            if plate:IsA("Frame") then
                all[plate.Name] = true
                local label = plate:FindFirstChildWhichIsA("TextLabel", true)
                local pos = label and label.AbsoluteSize.Magnitude > 0
                    and (label.AbsolutePosition + label.AbsoluteSize / 2)
                    or  (plate.AbsolutePosition + plate.AbsoluteSize / 2)
                if (pos - Vector2.new(19200, 10753)).Magnitude > 1000 then
                    live[plate.Name] = pos
                end
            end
        end
    end
    return live, all
end

local function getModelPositions(camera)
    local models = {}
    for _, char in ipairs(charFolder:GetChildren()) do
        if char ~= me.Character and char.Name ~= "StarterCharacter" then
            local root = char:FindFirstChild("humanoid_root_part")
            if root then
                local sp = camera:WorldToViewportPoint(root.Position)
                if sp.Z > 0 then
                    models[char] = Vector2.new(sp.X, sp.Y - 39)
                end
            end
        end
    end
    return models
end

task.spawn(function()
    while true do
        pcall(function()
            local camera = workspace.CurrentCamera
            if not camera then return end

            local livePlates, allPlates = getPlateData()
            local models = getModelPositions(camera)

            for plateName, char in pairs(links) do
                if not allPlates[plateName] or not char.Parent then
                    links[plateName] = nil
                end
            end

            local claimed = {}
            for _, char in pairs(links) do claimed[char] = true end

            local pairsList = {}
            for plateName, pos in pairs(livePlates) do
                if not links[plateName] then
                    for char, mpos in pairs(models) do
                        if not claimed[char] then
                            local d = (mpos - pos).Magnitude
                            if d < 150 then
                                pairsList[#pairsList + 1] = {char = char, name = plateName, dist = d}
                            end
                        end
                    end
                end
            end
            table.sort(pairsList, function(a,b) return a.dist < b.dist end)
            for _, pair in ipairs(pairsList) do
                if not links[pair.name] and not claimed[pair.char] then
                    links[pair.name] = pair.char
                    claimed[pair.char] = true
                end
            end

            local teamChars = {}
            for _, char in pairs(links) do teamChars[char] = true end

            for char in pairs(models) do
                local isTeam = teamChars[char] == true
                if not highlights[char] then
                    local hl = Instance.new("Highlight")
                    hl.Adornee = char
                    hl.Parent = char
                    hl.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
                    highlights[char] = hl
                end
                if isTeam then
                    highlights[char].FillColor = Color3.fromRGB(0, 255, 0)
                    highlights[char].FillTransparency = 1
                    highlights[char].OutlineColor = Color3.fromRGB(0, 255, 0)
                    highlights[char].OutlineTransparency = 1
                else
                    highlights[char].FillColor = Color3.fromRGB(255, 0, 0)
                    highlights[char].FillTransparency = 0.65
                    highlights[char].OutlineColor = Color3.fromRGB(255, 255, 255)
                    highlights[char].OutlineTransparency = 0
                end
            end

            for char, hl in pairs(highlights) do
                if not char.Parent or char.Parent ~= charFolder then
                    hl:Destroy()
                    highlights[char] = nil
                end
            end
        end)
        task.wait(0.5)
    end
end)