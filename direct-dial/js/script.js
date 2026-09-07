document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(location.search)
  const sample = window.DIRECT_DIAL_SAMPLE || {}
  const rawNumber = params.get("number") || params.get("n") || params.get("phone") || sample.number
  const rawName = params.get("name") || params.get("label") || sample.name
  const rawImage = params.get("img") || params.get("photo") || params.get("avatar") || params.get("dp") || sample.photo

  const screen = document.getElementById("screen")
  const avatar = document.getElementById("avatar")
  const avatarImg = document.getElementById("avatarImg")
  const avatarInitials = document.getElementById("avatarInitials")
  const nameEl = document.getElementById("contactName")
  const subtitle = document.getElementById("subtitle")
  const controlsGrid = document.getElementById("controlsGrid")
  const call = document.getElementById("call")
  const ctaLabel = document.getElementById("ctaLabel")
  const toast = document.getElementById("toast")

  const copyBtn = document.getElementById("copyBtn")
  const whatsappBtn = document.getElementById("whatsappBtn")
  const shareBtn = document.getElementById("shareBtn")
  const messageBtn = document.getElementById("messageBtn")
  const facetimeBtn = document.getElementById("facetimeBtn")
  const contactsBtn = document.getElementById("contactsBtn")

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  init()

  function init(){
    if(!rawNumber){
      showError("No number provided")
      return
    }

    const displayName = rawName ? rawName.trim() : ""
    const displayNumber = rawNumber.trim()
    const dialNumber = sanitizeForDialing(displayNumber)

    if(!isValidDialNumber(dialNumber)){
      showError("Invalid number")
      return
    }

    document.title = displayName ? `Call ${displayName}` : `Call ${displayNumber}`

    if(displayName){
      nameEl.textContent = displayName
      setAvatarInitials(displayName)
    } else {
      nameEl.textContent = displayNumber
    }

    if(rawImage){
      loadAvatarImage(rawImage.trim())
    }

    subtitle.textContent = displayNumber
    call.href = "tel:" + dialNumber
    call.setAttribute("aria-label", displayName ? `Call ${displayName}` : "Call number")

    controlsGrid.hidden = false

    setupCallRipple()
    setupKeyboardActivation(call)
    setupCopy(dialNumber)
    setupWhatsapp(dialNumber)
    setupShare(dialNumber, displayName || displayNumber)
    setupMessage(dialNumber)
    setupFacetime(dialNumber)
    setupContacts(dialNumber, displayName || displayNumber)
  }

  function setAvatarInitials(name){
    const parts = name.split(/\s+/).filter(Boolean)
    if(parts.length === 0) return
    const first = parts[0][0] || ""
    const second = parts.length > 1 ? parts[1][0] : (parts[0][1] || "")
    const initials = (first + second).toUpperCase()
    if(initials){
      avatarInitials.textContent = initials
      avatar.classList.add("has-name")
    }
  }

  function loadAvatarImage(url){
    // Only allow http(s) or data-image URLs — blocks javascript: and other schemes.
    if(!/^https?:\/\//i.test(url) && !/^data:image\//i.test(url)) return
    const probe = new Image()
    probe.referrerPolicy = "no-referrer"
    probe.onload = () => {
      avatarImg.src = url
      avatar.classList.add("has-image")
    }
    probe.onerror = () => { /* bad or unreachable link — keep initials/icon */ }
    probe.src = url
  }

  function sanitizeForDialing(value){
    let dial = value.replace(/[^\d+]/g, "")
    const hasLeadingPlus = dial.startsWith("+")
    dial = dial.replace(/\+/g, "")
    return hasLeadingPlus ? "+" + dial : dial
  }

  function isValidDialNumber(dial){
    return /^\+?\d{3,15}$/.test(dial)
  }

  function showError(message){
    nameEl.textContent = message
    subtitle.textContent = "This link is missing a valid number"
    subtitle.classList.add("error")
    ctaLabel.textContent = ""
    call.style.display = "none"
    document.title = "Direct Dial"
  }

  function setupCallRipple(){
    call.addEventListener("click", function(e){
      const circle = document.createElement("span")
      const diameter = Math.max(call.clientWidth, call.clientHeight)
      const radius = diameter / 2
      const offsetX = typeof e.offsetX === "number" ? e.offsetX : diameter / 2
      const offsetY = typeof e.offsetY === "number" ? e.offsetY : diameter / 2
      circle.style.width = circle.style.height = diameter + "px"
      circle.style.left = (offsetX - radius) + "px"
      circle.style.top = (offsetY - radius) + "px"
      circle.classList.add("ripple")
      const ripple = call.getElementsByClassName("ripple")[0]
      if(ripple){
        ripple.remove()
      }
      call.appendChild(circle)
    })
  }

  function setupKeyboardActivation(el){
    el.addEventListener("keydown", (e) => {
      if(e.key === " " || e.key === "Spacebar"){
        e.preventDefault()
        el.click()
      }
    })
  }

  function setupCopy(dialNumber){
    copyBtn.addEventListener("click", async () => {
      const ok = await copyToClipboard(dialNumber)
      showToast(ok ? "Number copied" : "Couldn't copy number")
    })
  }

  function setupWhatsapp(dialNumber){
    whatsappBtn.addEventListener("click", (e) => {
      e.preventDefault()
      location.href = "https://wa.me/" + dialNumber.replace("+", "")
    })
  }

  function setupShare(dialNumber, displayName){
    shareBtn.addEventListener("click", async () => {
      const shareData = { title: displayName, text: `${displayName}: ${dialNumber}` }
      try{
        if(navigator.share){
          await navigator.share(shareData)
          return
        }
      }catch(err){ /* user cancelled or share unsupported — fall back below */ }
      const ok = await copyToClipboard(`${displayName}: ${dialNumber}`)
      showToast(ok ? "Copied to share" : "Couldn't share")
    })
  }

  async function copyToClipboard(text){
    try{
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(text)
        return true
      }
    }catch(err){ /* fall through */ }

    try{
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.setAttribute("readonly", "")
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(textarea)
      return ok
    }catch(err){
      return false
    }
  }

  function setupMessage(dialNumber){
    messageBtn.addEventListener("click", (e) => {
      e.preventDefault()
      location.href = "sms:" + dialNumber
    })
  }

  // FaceTime URI scheme only works on Apple devices; it's a silent no-op
  // elsewhere, which matches how a greyed-out button would behave.
  function setupFacetime(dialNumber){
    facetimeBtn.addEventListener("click", (e) => {
      e.preventDefault()
      const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
      if(isApple){
        location.href = "facetime://" + dialNumber
      } else {
        showToast("FaceTime isn't available on this device")
      }
    })
  }

  function setupContacts(dialNumber, displayName){
    contactsBtn.addEventListener("click", () => {
      const vcard = buildVCard(displayName, dialNumber)
      const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${sanitizeFilename(displayName)}.vcf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      showToast("Contact saved")
    })
  }

  function buildVCard(name, tel){
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCardValue(name)}`,
      `TEL;TYPE=CELL:${tel}`,
      "END:VCARD",
      ""
    ].join("\r\n")
  }

  function escapeVCardValue(value){
    return String(value).replace(/([,;])/g, "\\$1")
  }

  function sanitizeFilename(name){
    const cleaned = String(name).replace(/[^\w\- ]/g, "").trim()
    return cleaned || "contact"
  }

  function showToast(message){
    toast.textContent = message
    toast.classList.add("show")
    clearTimeout(showToast._t)
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1600)
  }

})
