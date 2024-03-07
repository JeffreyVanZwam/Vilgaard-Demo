<template>
  <div class="w-full xs:w-120 h-screen transition-all top-0 py-4 px-2">
    <template v-if="booking">
      <div
        class="bg-white shadow-lg p-4 rounded-xl h-full relative z-9881 overflow-y-auto customScroll"
      >
        <div
          @click="$emit('closeOverlay', editMode), (editMode = false)"
          class="absolute top-4 right-4 flex items-center justify-center cursor-pointer"
        >
          <Icon
            name="solar:close-square-broken"
            class="h-8 w-8 text-standards-gray-midnight"
          />
        </div>
        <!-- Edit mode -->
        <template v-if="editMode">
          <h2
            class="text-palettes-theme-gray dark:text-palettes-theme-white text-xl font-medium my-6"
          >
            Reservering bewerken
          </h2>
          <form @submit.prevent="updateBooking" class="">
            <div class="flex flex-col gap-4">
              <!-- name -->
              <div class="relative flex items-center">
                <input
                  type="text"
                  v-model="booking.name"
                  autocomplete="name"
                  placeholder="Naam"
                  id="name"
                  class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                  :class="
                    error.errorName != 'nameError'
                      ? 'border-standards-gray-label text-standards-gray-label'
                      : ' border-red-400 text-red-400'
                  "
                  required
                />
                <label
                  for="name"
                  class="absolute left-2 transition-all cursor-pointer"
                  :class="
                    error.errorName != 'nameError'
                      ? ' text-standards-gray-label'
                      : ' text-red-400'
                  "
                  >Naam*</label
                >
              </div>
              <!-- start date -->
              <div class="">
                <div class="flex justify-end">
                  <label class="cbContainer flex justify-end items-center">
                    <input
                      type="checkbox"
                      id="datesFullDay_edit"
                      name="datesFullDay_edit"
                      v-model="datesFullDay"
                      @click="datesFullDay = !datesFullDay"
                    />
                    <span class="checkmark"></span>
                    Hele dag
                  </label>
                </div>

                <div class="flex items-center gap-4 w-full">
                  <div
                    class="relative flex items-center transition-all"
                    :class="!datesFullDay ? 'w-3/4' : 'w-full'"
                  >
                    <input
                      type="date"
                      v-model="dateFrom"
                      id="dateFrom"
                      class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all inputfield"
                      :class="[
                        error.errorName != 'dateError'
                          ? 'border-gray-100 text-standards-gray-label'
                          : ' border-red-400 text-red-400',
                        updateList === 'editCurrentAndNext' ||
                        updateList === 'editAll'
                          ? 'italic cursor-not-allowed select-none'
                          : 'normal cursor-pointer select-auto',
                      ]"
                      :readonly="
                        updateList === 'editCurrentAndNext' ||
                        updateList === 'editAll'
                      "
                      required
                    />
                    <label
                      for="dateFrom"
                      class="absolute left-2 transition-all cursor-pointer"
                      :class="
                        error.errorName != 'dateError'
                          ? ' text-standards-gray-label'
                          : ' text-red-400'
                      "
                      >Start van reservering*</label
                    >
                  </div>
                  <div
                    class="relative flex items-center"
                    :class="!datesFullDay ? 'block' : 'hidden'"
                  >
                    <input
                      type="time"
                      v-model="timeFrom"
                      id="timeFrom"
                      class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
                      :class="
                        error.errorName != 'dateError' ||
                        error.errorName != 'dateRepeatError'
                          ? 'border-gray-100 text-standards-gray-label'
                          : ' border-red-400 text-red-400'
                      "
                      required
                    />
                    <label
                      for="timeFrom"
                      class="absolute left-2 transition-all cursor-pointer"
                      :class="
                        error.errorName != 'dateError' ||
                        error.errorName != 'dateRepeatError'
                          ? ' text-standards-gray-label'
                          : ' text-red-400'
                      "
                      >Starttijd*</label
                    >
                  </div>
                </div>
              </div>
              <!-- end date -->
              <div class="">
                <div class="flex items-center gap-4 w-full">
                  <div
                    class="relative flex items-center transition-all"
                    :class="!datesFullDay ? 'w-3/4' : 'w-full'"
                  >
                    <input
                      type="date"
                      v-model="dateTo"
                      id="dateTo"
                      class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all inputfield"
                      :class="[
                        error.errorName != 'dateError'
                          ? 'border-gray-100 text-standards-gray-label'
                          : ' border-red-400 text-red-400',
                        updateList === 'editCurrentAndNext' ||
                        updateList === 'editAll'
                          ? 'italic cursor-not-allowed select-none'
                          : 'normal cursor-pointer select-auto',
                      ]"
                      :readonly="
                        updateList === 'editCurrentAndNext' ||
                        updateList === 'editAll'
                      "
                      required
                    />
                    <label
                      for="dateTo"
                      class="absolute left-2 transition-all cursor-pointer"
                      :class="
                        error.errorName != 'dateError'
                          ? ' text-standards-gray-label'
                          : ' text-red-400'
                      "
                      >Eind van reservering*</label
                    >
                  </div>

                  <div
                    class="relative flex items-center"
                    :class="!datesFullDay ? 'block' : 'hidden'"
                  >
                    <input
                      type="time"
                      v-model="timeTo"
                      id="timeTo"
                      class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
                      :class="
                        error.errorName != 'dateError' ||
                        error.errorName != 'dateRepeatError'
                          ? 'border-gray-100 text-standards-gray-label'
                          : ' border-red-400 text-red-400'
                      "
                      required
                    />
                    <label
                      for="timeTo"
                      class="absolute left-2 transition-all cursor-pointer"
                      :class="
                        error.errorName != 'dateError' ||
                        error.errorName != 'dateRepeatError'
                          ? ' text-standards-gray-label'
                          : ' text-red-400'
                      "
                      >Eindtijd*</label
                    >
                  </div>
                </div>
              </div>

              <!-- description -->
              <div class="relative flex items-center">
                <textarea
                  v-model="booking.description"
                  id="description"
                  class="w-full border-standards-gray-label text-standards-gray-label rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                ></textarea>
                <label
                  for="description"
                  class="absolute left-2 transition-all cursor-pointer text-standards-gray-label"
                  >Opmerkingen</label
                >
              </div>
              <!-- pax -->
              <div class="relative flex items-center">
                <input
                  type="number"
                  v-model="booking.pax"
                  placeholder="Aantal personen"
                  id="pax"
                  class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                  :class="
                    error.errorName != 'paxError'
                      ? 'border-standards-gray-label text-standards-gray-label'
                      : ' border-red-400 text-red-400'
                  "
                />
                <label
                  for="pax"
                  class="absolute left-2 transition-all cursor-pointer"
                  :class="
                    error.errorName != 'paxError'
                      ? ' text-standards-gray-label'
                      : ' text-red-400'
                  "
                  >Aantal personen</label
                >
              </div>
              <!-- roomsetup -->
              <div class="relative flex items-center">
                <input
                  type="text"
                  v-model="booking.roomsetup"
                  placeholder="Zaalopstelling"
                  id="roomsetup"
                  class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                  :class="
                    error.errorName != 'setupError'
                      ? 'border-standards-gray-label text-standards-gray-label'
                      : ' border-red-400 text-red-400'
                  "
                />
                <label
                  for="roomsetup"
                  class="absolute left-2 transition-all cursor-pointer"
                  :class="
                    error.errorName != 'setupError'
                      ? ' text-standards-gray-label'
                      : ' text-red-400'
                  "
                  >Zaalopstelling</label
                >
              </div>

              <!-- Tabs -->
              <div
                class="flex items-center w-full justify-start gap-2 mt-4 border-b border-standards-gray-label overflow-x-auto"
              >
                <div
                  class="font-extralight text-sm cursor-pointer p-1 rounded-t-lg overflow-hidden min-w-max flex gap-2 item-center"
                  :class="
                    selectedTab == 'rooms'
                      ? 'text-standards-gray-light bg-standards-gray-dark'
                      : 'text-standards-gray-mid bg-standards-gray-label'
                  "
                  @click="selectedTab = 'rooms'"
                >
                  <icon name="solar:signpost-bold-duotone" class="w-5 h-5" />
                  <span class="text-standards-gray-mid font-semibold">{{
                    selectedRooms.length
                  }}</span>
                </div>

                <div
                  class="font-extralight text-sm cursor-pointer p-1 rounded-t-lg overflow-hidden min-w-max flex gap-2 item-center"
                  :class="
                    selectedTab == 'perks'
                      ? 'text-standards-gray-light bg-standards-gray-dark'
                      : 'text-standards-gray-mid bg-standards-gray-label'
                  "
                  @click="selectedTab = 'perks'"
                >
                  <icon name="solar:cup-bold-duotone" class="w-5 h-5" />
                  <span class="text-standards-gray-mid font-semibold">{{
                    selectedPerks.length
                  }}</span>
                </div>

                <div
                  class="font-extralight text-sm cursor-pointer p-1 rounded-t-lg overflow-hidden min-w-max flex gap-2 item-center"
                  :class="
                    selectedTab == 'persons'
                      ? 'text-standards-gray-light bg-standards-gray-dark'
                      : 'text-standards-gray-mid bg-standards-gray-label'
                  "
                  @click="selectedTab = 'persons'"
                >
                  <icon
                    name="solar:user-rounded-bold-duotone"
                    class="w-5 h-5"
                  />
                  <span class="text-standards-gray-mid font-semibold">{{
                    selectedPersons.length
                  }}</span>
                </div>

                <div
                  class="font-extralight text-sm cursor-pointer p-1 rounded-t-lg overflow-hidden min-w-max flex gap-2 item-center"
                  :class="
                    selectedTab == 'settings'
                      ? 'text-standards-gray-light bg-standards-gray-dark'
                      : 'text-standards-gray-mid bg-standards-gray-label'
                  "
                  @click="selectedTab = 'settings'"
                >
                  <icon name="solar:feed-bold-duotone" class="w-5 h-5" />
                  <span class="text-standards-gray-mid font-semibold uppercase"
                    >Y</span
                  >
                </div>
              </div>

              <!-- Rooms -->
              <div
                class="flex items-start gap-4 w-full"
                v-if="selectedTab == 'rooms'"
              >
                <ul
                  class="w-full border-standards-gray-label bg-gray-100 text-palettes-theme-gray rounded-md p-2 focus:outline-0"
                >
                  <div class="" v-if="rooms.length != 0">
                    <li
                      v-for="room in rooms"
                      :key="room.name"
                      class="flex items-center gap-2 cursor-pointer"
                      @click="selectRoom(room)"
                    >
                      <div
                        class="flex items-center justify-center w-5 h-5 rounded-md bg-white"
                      >
                        <icon
                          name="solar:check-read-line-duotone"
                          v-if="selectedRooms.includes(room)"
                          class="h-5 w-5 text-palettes-theme-primary"
                        />
                      </div>
                      {{ room.name }}
                    </li>
                  </div>
                  <span class="font-semibold" v-else
                    >Er zijn geen zalen voor deze locatie</span
                  >
                  <div
                    v-if="allAccessibleRoomsInt > 0"
                    class="flex gap-2 mt-2 cursor-pointer"
                    @click="showAccessibleRooms = !showAccessibleRooms"
                  >
                    <icon name="solar:buildings-bold-duotone" class="w-5 h-5" />
                    <span class="text-sm font-semibold"
                      >Toon overige locaties</span
                    >
                  </div>

                  <div
                    class=""
                    v-if="
                      showAccessibleRooms &&
                      hasAccessToComponent(
                        'calendar_reservationsView_crossLocation'
                      )
                    "
                  >
                    <div
                      class="flex flex-col gap-2 pt-2"
                      v-for="location in allRoomsAccessible"
                    >
                      <div class="" v-if="location.rooms.length != 0">
                        <span class="font-semibold uppercase text-sm">
                          {{ location.name }}
                        </span>
                        <li
                          v-for="room in location.rooms"
                          :key="room.name"
                          class="flex items-center gap-2 cursor-pointer"
                          @click="selectRoom(room)"
                        >
                          <div
                            class="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-black"
                          >
                            <icon
                              name="solar:check-read-line-duotone"
                              v-if="selectedRooms.includes(room)"
                              class="h-5 w-5 text-palettes-theme-primary"
                            />
                          </div>
                          {{ room.name }}
                        </li>
                      </div>
                    </div>
                  </div>
                </ul>
              </div>

              <!-- Perks -->
              <div
                class="flex items-start gap-4 w-full"
                v-if="selectedTab == 'perks'"
              >
                <ul
                  class="w-full border-standards-gray-label bg-gray-100 text-palettes-theme-gray rounded-md p-2 focus:outline-0"
                >
                  <li
                    v-for="perk in perks"
                    :key="perk.name"
                    class="flex items-center gap-2 cursor-pointer justify-between"
                  >
                    <div
                      class="flex items-center gap-2"
                      @click="selectPerk(perk)"
                    >
                      <div
                        class="flex items-center justify-center w-5 h-5 rounded-md bg-white"
                      >
                        <icon
                          name="solar:check-read-line-duotone"
                          v-if="selectedPerks.includes(perk)"
                          class="h-5 w-5 text-palettes-theme-primary"
                        />
                      </div>
                      {{ perk.name }}
                    </div>
                    <div
                      class="flex items-center"
                      v-if="
                        perk.hasCustomAmount && selectedPerks.includes(perk)
                      "
                    >
                      <icon
                        @click="perk.count--"
                        name="solar:minus-square-bold-duotone"
                        class="w-5 h-5 cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid"
                        :class="perk.count == 0 ? 'invisible' : 'visible'"
                      />
                      <input
                        type="number"
                        v-model="perk.count"
                        min="0"
                        class="w-8 text-xs bg-transparent text-center"
                      />
                      <icon
                        @click="perk.count++"
                        name="solar:add-square-bold-duotone"
                        class="w-5 h-5 cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid"
                      />
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Persons -->
              <div
                class="flex items-start gap-4 w-full"
                v-if="selectedTab == 'persons'"
              >
                <ul
                  class="w-full border-standards-gray-label bg-gray-100 dark:bg-standards-gray-midnight text-palettes-theme-gray dark:text-palettes-theme-white rounded-md p-2 focus:outline-0"
                >
                  <li
                    v-for="admin in admins"
                    :key="admin.email"
                    class="flex items-center gap-2 cursor-pointer justify-between"
                  >
                    <div
                      class="flex items-center gap-2"
                      @click="selectPerson(admin)"
                    >
                      <div
                        class="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-black"
                      >
                        <icon
                          name="solar:check-read-line-duotone"
                          v-if="selectedPersons.includes(admin)"
                          class="h-5 w-5 text-palettes-theme-primary"
                        />
                      </div>
                      {{ admin.firstname + " " + admin.lastname }}
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Settings -->
              <div
                class="flex flex-col items-start gap-4 w-full"
                v-if="selectedTab == 'settings'"
              >
                <div
                  class="w-full border-standards-gray-label bg-gray-100 dark:bg-palettes-theme-blackForm text-palettes-theme-gray dark:text-palettes-theme-white rounded-md p-2 focus:outline-0 flex items-center gap-2 cursor-pointer"
                  @click="booking.isExportable = !booking.isExportable"
                >
                  <div
                    class="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-black"
                  >
                    <icon
                      name="solar:check-read-line-duotone"
                      v-if="booking.isExportable"
                      class="h-5 w-5 text-palettes-theme-primary"
                    />
                  </div>
                  Exporteerbaar
                </div>
                <div class="relative flex items-center w-full">
                  <input
                    type="text"
                    v-model="booking.rssLocation"
                    placeholder="RSS locatienaam"
                    id="rssLocation"
                    class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield border-standards-gray-label text-standards-gray-label"
                  />
                  <label
                    for="rssLocation"
                    class="absolute left-2 transition-all cursor-pointer text-standards-gray-label"
                    >RSS locatienaam</label
                  >
                </div>
              </div>

              <!-- error -->
              <p
                v-if="error.errorName != null"
                :class="
                  error.errorType == 'error'
                    ? 'text-red-400'
                    : ' text-green-mid'
                "
              >
                {{ error.errorMessage }}
              </p>

              <!-- BTN's -->
              <div class="relative flex items-center gap-4 select-none">
                <button
                  type="confirm"
                  class="bg-palettes-theme-primary rounded-lg text-white-full uppercase transform transition-all font-medium text-sm px-5 h-9.5"
                  :class="
                    isLoading
                      ? ' bg-opacity-60 cursor-not-allowed'
                      : ' bg-opacity-100 cursor-pointer'
                  "
                >
                  <Icon
                    name="solar:hourglass-broken"
                    class="h-6 w-6 text-palettes-theme-gray hourglass"
                    v-if="isLoading"
                  />

                  <span v-else> Opslaan </span>
                </button>
                <div
                  @click="closeEditMode"
                  class="bg-standards-gray-label rounded-lg text-palettes-theme-gray uppercase font-medium text-sm px-5 h-9.5 flex items-center cursor-pointer"
                >
                  Annuleren
                </div>
              </div>
            </div>
          </form>
        </template>

        <!-- Show mode -->
        <template v-else>
          <h2 class="text-palettes-theme-gray text-xl font-medium mt-6 mb-2">
            {{ booking.name }}
          </h2>
          <div class="flex gap-1 mb-4">
            <icon
              v-if="
                hasAccessToComponent('calendar_reservationsView_createBooking')
              "
              name="solar:copy-broken"
              class="w-5 h-5 text-standards-gray-dark cursor-pointer order-1"
              @click="cloneBooking(booking)"
            />
            <icon
              v-if="
                hasAccessToComponent('calendar_reservationsView_editBooking')
              "
              name="solar:pen-broken"
              class="w-5 h-5 text-standards-gray-dark cursor-pointer order-1"
              @click="checkForRepeatEdit()"
            />
            <icon
              v-if="
                hasAccessToComponent('calendar_reservationsView_deleteBooking')
              "
              name="solar:trash-bin-minimalistic-broken"
              class="w-5 h-5 text-red-400 cursor-pointer order-2"
              @click="checkForRepeatDelete()"
            />
          </div>
          <div
            class="text-standards-gray-label flex items-center gap-1 xs:gap-2 text-sm sm:text-base"
          >
            <div class="flex items-center gap-1">
              <!-- <icon name="solar:play-circle-bold" /> -->
              <div class="">
                {{
                  `${booking.dateFd}-${booking.dateFm}-${booking.dateFy.replace(
                    "20",
                    "'"
                  )}`
                }}
              </div>

              <div class="">
                {{
                  booking.fullDay
                    ? `Hele dag`
                    : `${booking.dateFh}:${booking.dateFi}`
                }}
              </div>
            </div>
            <div class="">||</div>
            <div class="flex items-center gap-1">
              <!-- <icon name="solar:stop-circle-bold" /> -->
              <div class="">
                {{
                  `${booking.dateTd}-${booking.dateTm}-${booking.dateTy.replace(
                    "20",
                    "'"
                  )}`
                }}
              </div>

              <div class="">
                {{
                  booking.fullDay
                    ? `Hele dag`
                    : `${booking.dateTh}:${booking.dateTi}`
                }}
              </div>
            </div>
          </div>
          <div
            class="flex items-center gap-1 text-standards-gray-label text-sm"
          >
            <span class="font-semibold">Pax:</span>
            <template v-if="booking.pax && booking.pax != ''">
              <span class="font-extralight">{{ booking.pax }}</span>
              <span class="font-extralight">{{
                booking.pax && booking.pax > 1 ? "personen" : "persoon"
              }}</span>
            </template>
            <template v-else>
              <span class="font-extralight">-</span>
            </template>
          </div>
          <div
            class="border-y py-2 mt-4 italic font-light text-sm"
            :class="
              booking.description != ''
                ? 'text-standards-gray-midnight'
                : ' text-standards-gray-label'
            "
          >
            {{
              booking.description != ""
                ? booking.description
                : "Geen details ingevuld"
            }}
          </div>
          <!-- Locations -->
          <div class="mt-4 flex items-center gap-2 text-standards-gray-dark">
            <icon name="solar:signpost-bold-duotone" class="w-5 h-5" />
            <span class="font-semibold">Geselecteerde zalen</span>
          </div>
          <div class="text-standards-gray-label text-sm sm:text-base mt-2">
            <div
              class="flex items-center gap-1"
              v-for="room in booking.rooms"
              :key="room.name"
            >
              <icon name="solar:traffic-line-duotone" class="" />
              {{ room.name }}
            </div>
          </div>
          <!-- Roomsetup -->
          <div class="mt-4 flex items-center gap-2 text-standards-gray-dark">
            <icon
              name="solar:posts-carousel-horizontal-bold-duotone"
              class="w-5 h-5"
            />
            <span class="font-semibold">Zaalopstelling</span>
          </div>
          <div class="text-standards-gray-label text-sm sm:text-base mt-2">
            {{
              booking.roomsetup && booking.roomsetup != ""
                ? booking.roomsetup
                : "Niet bekend"
            }}
          </div>
          <!-- Assemblee -->
          <div
            class="mt-4 mb-2 flex items-center gap-2 text-standards-gray-dark"
          >
            <icon name="solar:cup-bold-duotone" class="w-5 h-5" />
            <span class="font-semibold">Benodigdheden</span>
          </div>
          <template v-if="booking.assemblee.length != 0">
            <div
              class="flex items-center gap-2 justify-start text-standards-gray-label"
              v-for="perk in perksWithData"
              :key="
                perk.assemblee ? perk.assemblee.name : perk.assembleeNameBackup
              "
            >
              <icon name="solar:traffic-line-duotone" class="" />
              <span>
                {{
                  perk.assemblee
                    ? perk.assemblee.name
                    : perk.assembleeNameBackup
                }}
              </span>
              <template v-if="perk.assemblee">
                <span
                  class="font-light"
                  v-if="perk.assemblee.hasCustomAmount"
                  >{{ `(${perk.count}x)` }}</span
                >
              </template>
              <template v-else>
                <span class="font-light" v-if="perk.count != 0">{{
                  `(${perk.count}x)`
                }}</span>
              </template>
            </div>
          </template>
          <template v-else>
            <span class="text-standards-gray-label">-</span>
          </template>
          <!-- Persons -->
          <div
            class="mt-4 mb-2 flex items-center gap-2 text-standards-gray-dark"
          >
            <icon name="solar:user-hand-up-bold-duotone" class="w-5 h-5" />
            <span class="font-semibold">Aangewezen medewerkers</span>
          </div>
          <template v-if="booking.persons.length != 0">
            <div
              class="flex items-center gap-2 justify-start text-standards-gray-label"
              v-for="person in booking.persons"
              :key="person.email"
            >
              <span>
                {{ person.firstname + " " + person.lastname }}
              </span>
            </div>
          </template>
          <template v-else>
            <span class="text-standards-gray-label">Niemand toegewezen</span>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { useUserStore } from "@/store/user";

export default {
  props: {
    booking: Object,
    rooms: Array,
    allRoomsAccessible: Array,
    allAccessibleRoomsInt: Number,
    perks: Array,
    admins: Array,
    mayShowEdit: Boolean,
    updateList: String,
  },
  setup(props, { emit }) {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();

    const name = ref("");
    const description = ref("");
    const dateTo = ref(null);
    const timeTo = ref(null);
    const dateFrom = ref("");
    const timeFrom = ref("");
    const datesFullDay = ref(false);
    const error = ref({ errorName: null, errorMessage: "", errorType: null });
    const isLoading = ref(false);
    const editMode = ref(false);
    const showAccessibleRooms = ref(false);
    const showEdit = toRefs(props).mayShowEdit;
    const selectedRooms = ref([]);
    const selectedPerks = ref([]);
    const selectedPersons = ref([]);
    const selectedTab = ref("rooms");
    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const perksWithData = computed(() => {
      return props.booking.assemblee.filter((b) => {
        if (b.assemblee || b.assembleeNameBackup) {
          return true;
        }
      });
    });

    const checkForRepeatEdit = () => {
      emit("toggleRepeatModalEdit");
    };

    const checkForRepeatDelete = () => {
      emit("toggleRepeatModalDelete");
      // Former action:
      // $emit('toggleDelete', booking)
    };

    const selectRoom = (room) => {
      const i = selectedRooms.value.indexOf(room);
      if (i > -1) {
        selectedRooms.value.splice(i, 1);
      } else {
        selectedRooms.value.push(room);
      }
    };

    const selectPerk = (perk) => {
      const i = selectedPerks.value.indexOf(perk);
      if (i > -1) {
        selectedPerks.value.splice(i, 1);
      } else {
        selectedPerks.value.push(perk);
      }
    };

    const selectPerson = (person) => {
      const i = selectedPersons.value.indexOf(person);
      if (i > -1) {
        selectedPersons.value.splice(i, 1);
      } else {
        selectedPersons.value.push(person);
      }
    };

    const toggleEditMode = () => {
      editMode.value = true;
      datesFullDay.value = props.booking.fullDay;
      if (datesFullDay.value) {
        dateFrom.value = `${props.booking.dateFy}-${props.booking.dateFm}-${props.booking.dateFd}`;
        dateTo.value = `${props.booking.dateTy}-${props.booking.dateTm}-${props.booking.dateTd}`;
        timeFrom.value = "00:00";
        timeTo.value = "23:59";
      } else {
        dateFrom.value = `${props.booking.dateFy}-${props.booking.dateFm}-${props.booking.dateFd}`;
        dateTo.value = `${props.booking.dateTy}-${props.booking.dateTm}-${props.booking.dateTd}`;
        timeFrom.value = `${props.booking.dateFh}:${props.booking.dateFi}`;
        timeTo.value = `${props.booking.dateTh}:${props.booking.dateTi}`;
      }
    };

    const hasAccessToComponent = (rightName) => {
      let value = false;
      userRights.value.map((right) => {
        if (right.name == rightName) {
          value = true;
        }
      });
      return value;
    };

    const closeEditMode = () => {
      editMode.value = false;
      emit("closeEditModal");
    };

    const closeDeleteMode = () => {
      deleteMode.value = false;
      emit("closeDeleteModal");
    };

    const cloneBooking = (booking) => {
      emit("closeOverlay", editMode.value);
      emit("preSetBooking", booking);
      editMode.value = false;
    };

    const updateBooking = async () => {
      error.value.errorName = null;
      error.value.errorMessage = "";
      error.value.errorType = null;
      if (dateTo.value < dateFrom.value) {
        error.value.errorName = "dateError";
        error.value.errorMessage = "De einddatum ligt voor de startdatum.";
        error.value.errorType = "error";
        return;
      }

      if (
        datesFullDay.value == false &&
        dateTo.value == dateFrom.value &&
        timeFrom.value == timeTo.value
      ) {
        error.value.errorName = "dateError";
        error.value.errorMessage =
          "De start- en einddatum kunnen niet gelijk zijn.";
        error.value.errorType = "error";
        return;
      }

      if (
        (props.updateList == "editCurrentAndNext" ||
          props.updateList == "editAll") &&
        datesFullDay.value == false &&
        timeTo.value <= timeFrom.value
      ) {
        // TODO: check if this code needs to be altered. What happens for bookings that span multiple nights and are part of a repeated booking?
        error.value.errorName = "dateError";
        error.value.errorMessage =
          "De eindtijd ligt voor / is gelijk aan de starttijd.";
        error.value.errorType = "error";
        return;
      }

      if (selectedRooms.value.length == 0) {
        error.value.errorName = "roomError";
        error.value.errorMessage =
          "Er dient minimaal 1 zaal gekozen te worden.";
        error.value.errorType = "error";
        return;
      }

      let obj = {
        name: props.booking.name,
        description: props.booking.description,
        roomsetup: props.booking.roomsetup,
        pax: props.booking.pax,
        fullDay: datesFullDay.value,
        dateFrom: dateFrom.value,
        timeFrom: timeFrom.value,
        dateTo: dateTo.value,
        timeTo: timeTo.value,
        rooms: selectedRooms.value,
        perks: selectedPerks.value,
        persons: selectedPersons.value,
        isExportable: props.booking.isExportable,
        rssLocation: props.booking.rssLocation,
      };

      isLoading.value = true;
      await $fetch("/api/updateBooking", {
        method: "post",
        body: {
          auth: $authDirect(),
          details: obj,
          updateList: props.updateList,
          id: props.booking.id,
          bookingGroup: props.booking.bookingGroup,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
          isLoading.value = false;
          selectedRooms.value = [];
          if (returnBody.snackbar.type == "success") {
            emit("updateBookings");
            emit("closeOverlay");
            closeEditMode();
          }
        }
      });
    };

    watch(datesFullDay, (n) => {
      if (n) {
        timeFrom.value = "00:00";
        timeTo.value = "23:59";
      } else {
        timeTo.value = `${props.booking.dateTh}:${props.booking.dateTi}`;
        timeFrom.value = `${props.booking.dateFh}:${props.booking.dateFi}`;
      }
    });

    watch(showEdit, async (n) => {
      if (n) {
        toggleEditMode();
        props.rooms.map((r) => {
          props.booking.rooms.map((b) => {
            if (b.id == r.id) {
              selectedRooms.value.push(r);
            }
          });
        });
        props.allRoomsAccessible.map((r) => {
          r.rooms.map((sr) => {
            props.booking.rooms.map((b) => {
              if (b.id == sr.id) {
                selectedRooms.value.push(sr);
              }
            });
          });
        });
        selectedPerks.value = props.perks.filter((p) => {
          let val = false;
          props.booking.assemblee.map((a) => {
            if (a.assembleeId && a.assembleeId == p.id) {
              val = true;
            }
          });
          return val;
        });
        selectedPersons.value = props.admins.filter((a) => {
          let val = false;
          props.booking.persons.map((p) => {
            if (p.id == a.id) {
              val = true;
            }
          });
          return val;
        });
      }
    });

    return {
      error,
      name,
      datesFullDay,
      dateFrom,
      timeFrom,
      dateTo,
      timeTo,
      description,
      isLoading,
      editMode,
      updateBooking,
      toggleEditMode,
      checkForRepeatEdit,
      checkForRepeatDelete,
      selectedRooms,
      selectedPerks,
      selectedPersons,
      selectedTab,
      selectRoom,
      selectPerk,
      selectPerson,
      closeEditMode,
      closeDeleteMode,
      hasAccessToComponent,
      perksWithData,
      cloneBooking,
      showAccessibleRooms,
    };
  },
};
</script>

<style scoped>
.cbContainer {
  @apply flex items-center;
  position: relative;
  padding-left: 20px;
  cursor: pointer;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.cbContainer input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  @apply bg-standards-gray-label;
  position: absolute;
  top: 2px;
  left: 0;
  height: 16px;
  width: 16px;
  border-radius: 5px;
  transition: all 150ms ease-in-out;
}

/* On mouse-over, add a grey background color */
.cbContainer:hover input ~ .checkmark {
  @apply bg-standards-gray-dark;
}

/* When the checkbox is checked, add a blue background */
.cbContainer input:checked ~ .checkmark {
  @apply bg-palettes-vilgaard-primary;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.cbContainer input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.cbContainer .checkmark:after {
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>