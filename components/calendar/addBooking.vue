<template>
  <div class="xs:w-96 w-full h-screen transition-all top-0 py-4 px-2">
    <div
      class="bg-white dark:bg-black shadow-lg p-4 rounded-xl h-full relative z-9881 overflow-y-auto customScroll"
    >
      <div
        @click="$emit('closeOverlay')"
        class="absolute top-4 right-4 flex items-center justify-center cursor-pointer"
      >
        <Icon
          name="solar:close-square-broken"
          class="h-8 w-8 text-standards-gray-midnight dark:text-standards-gray-mid"
        />
      </div>
      <h2
        class="text-palettes-theme-gray dark:text-palettes-theme-white text-xl font-medium my-6"
      >
        Reservering toevoegen
      </h2>
      <form @submit.prevent="addBooking" class="">
        <div class="flex flex-col gap-4">
          <!-- name -->
          <div class="relative flex items-center">
            <input
              type="text"
              v-model="name"
              autocomplete="name"
              placeholder="Naam"
              id="name"
              class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
              :class="
                error.errorName != 'nameError'
                  ? 'border-gray-100 text-standards-gray-label'
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
              <label
                class="cbContainer flex justify-end items-center text-standards-gray-midnight dark:text-standards-gray-mid"
              >
                <input
                  type="checkbox"
                  id="datesFullDay"
                  name="datesFullDay"
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
                  class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
                  :class="
                    error.errorName != 'dateError'
                      ? 'border-gray-100 text-standards-gray-label'
                      : ' border-red-400 text-red-400'
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
                  class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
                  :class="
                    error.errorName != 'dateError'
                      ? 'border-gray-100 text-standards-gray-label'
                      : ' border-red-400 text-red-400'
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

          <hr />

          <!-- Cutout -->
          <div class="flex gap-8 justify-end">
            <div
              class="flex gap-2 items-center cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid"
              @click="showRepeatOptions = !showRepeatOptions"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
              >
                <g class="fill-current">
                  <path
                    d="M9.5 19.75a.75.75 0 0 0 0-1.5v1.5ZM11 5v.75a.75.75 0 0 0 .53-1.28L11 5ZM9.53 2.47a.75.75 0 0 0-1.06 1.06l1.06-1.06ZM9.5 18.25H9v1.5h.5v-1.5ZM9 5.75h2v-1.5H9v1.5Zm2.53-1.28l-2-2l-1.06 1.06l2 2l1.06-1.06ZM1.25 12A7.75 7.75 0 0 0 9 19.75v-1.5A6.25 6.25 0 0 1 2.75 12h-1.5Zm1.5 0A6.25 6.25 0 0 1 9 5.75v-1.5A7.75 7.75 0 0 0 1.25 12h1.5Z"
                  ></path>
                </g>
                <g
                  :class="
                    bookingIsRepeated
                      ? ' fill-palettes-theme-primary'
                      : ' fill-current opacity-50'
                  "
                >
                  <path
                    d="M13 19v-.75a.75.75 0 0 0-.53 1.28L13 19Zm1.47 2.53a.75.75 0 1 0 1.06-1.06l-1.06 1.06Zm.03-17.28a.75.75 0 0 0 0 1.5v-1.5Zm.5 14h-2v1.5h2v-1.5Zm-2.53 1.28l2 2l1.06-1.06l-2-2l-1.06 1.06ZM14.5 5.75h.5v-1.5h-.5v1.5ZM21.25 12A6.25 6.25 0 0 1 15 18.25v1.5A7.75 7.75 0 0 0 22.75 12h-1.5Zm1.5 0A7.75 7.75 0 0 0 15 4.25v1.5A6.25 6.25 0 0 1 21.25 12h1.5Z"
                  ></path>
                </g>
              </svg>
              <span>{{
                bookingIsRepeated ? "Herhaald" : "Niet herhaald"
              }}</span>
              <div
                v-if="bookingIsRepeated"
                class="flex gap-2 items-center cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <g fill="none" stroke="#888888" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      d="M14.5 17.1L8 6m10 10.2c0 .994-.84 1.8-1.875 1.8c-1.036 0-1.875-.806-1.875-1.8s.84-1.8 1.875-1.8c1.035 0 1.875.806 1.875 1.8Zm-8.5.9L16 6M6 16.2c0 .994.84 1.8 1.875 1.8c1.036 0 1.875-.806 1.875-1.8s-.84-1.8-1.875-1.8C6.839 14.4 6 15.206 6 16.2Z"
                    />

                    <path
                      d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"
                      opacity=".5"
                      :class="
                        excludedDates && excludedDates.length != 0
                          ? ' stroke-palettes-theme-primary'
                          : ' stroke-current opacity-50'
                      "
                    />
                  </g>
                </svg>

                <span>{{
                  excludedDates && excludedDates.length != 0
                    ? "Onderbroken"
                    : "Aaneengesloten"
                }}</span>
              </div>
            </div>
          </div>

          <div class="" v-if="showRepeatOptions">
            <ul class="">
              <!-- Don't repeat -->
              <li
                @click="bookingIsRepeated = false"
                class="flex items-center gap-1 cursor-pointer w-max"
              >
                <icon
                  name="solar:check-circle-bold"
                  class="w-4 h-4 text-palettes-theme-primary transform -translate-x-[1px]"
                  v-if="!bookingIsRepeated"
                />
                <div
                  class="w-3.5 h-3.5 bg-standards-gray-dark dark:bg-standards-gray-mid rounded-full"
                  v-else
                ></div>
                <span
                  class="text-sm xs:text-base text-standards-gray-midnight dark:text-standards-gray-mid w-max"
                >
                  Niet herhalen
                </span>
              </li>
              <!-- Repeat -->
              <li
                @click="bookingIsRepeated = true"
                class="flex flex-col sm:flex-row items-start sm:items-center gap-1 cursor-pointer justify-start grow-0"
              >
                <div class="flex items-center gap-1">
                  <icon
                    name="solar:check-circle-bold"
                    class="w-4 h-4 min-w-4 min-h-4 text-palettes-theme-primary transform -translate-x-[1px]"
                    v-if="bookingIsRepeated"
                  />
                  <div
                    class="w-3.5 h-3.5 min-w-3.5 min-h-3.5 bg-standards-gray-dark dark:bg-standards-gray-mid rounded-full"
                    v-else
                  ></div>
                  <span
                    class="text-sm xs:text-base text-standards-gray-midnight dark:text-standards-gray-mid"
                  >
                    Herhaal elke
                  </span>
                </div>
                <div class="flex items-center gap-1 ml-5 sm:ml-0">
                  <!-- Interval -->
                  <div class="relative flex items-center w-min grow-0">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      v-model="repeatCustom_interval"
                      id="repeatCustom_interval"
                      class="w-8 rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield capitalize"
                      :class="
                        error.errorName != 'repeatIntervalError'
                          ? 'border-gray-100 text-standards-gray-label'
                          : ' border-red-400 text-red-400'
                      "
                    />
                  </div>
                  <!-- Period -->
                  <div class="relative flex items-center">
                    <input
                      type="text"
                      v-model="repeatCustom_periodVisual"
                      @click="showRepeatPeriodDD = !showRepeatPeriodDD"
                      id="repeatCustom_periodVisual"
                      class="w-32 rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield capitalize"
                      :class="
                        error.errorName != 'repeatPeriodError'
                          ? 'border-gray-100 text-standards-gray-label'
                          : ' border-red-400 text-red-400'
                      "
                      readonly
                    />
                    <div
                      class="top-10 flex flex-col p-2 mt-2 shadow-mainBlack bg-standards-gray-mid absolute w-full z-10"
                      v-if="showRepeatPeriodDD"
                    >
                      <span
                        v-for="period in repeatOptions"
                        @click="setRepeatPeriod(period)"
                        >{{
                          repeatCustom_interval == 1
                            ? period.display.singular
                            : period.display.plural
                        }}</span
                      >
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <!-- Extra week fields -->
            <div
              class="ml-5"
              v-if="repeatCustom_period && repeatCustom_period.int == 7"
            >
              <span
                class="text-xs font-semibold"
                :class="
                  error.errorName != 'dateRepeatdayWeekError'
                    ? 'text-palettes-theme-gray dark:text-standards-gray-mid'
                    : 'text-red-400'
                "
                >Wordt herhaald op</span
              >
              <div class="flex gap-2 mt-1">
                <div
                  class="rounded-full border w-6 h-6 flex items-center justify-center text-sm text-palettes-theme-gray border-opacity-50 cursor-pointer transition-all"
                  :class="
                    selectedWeekDays.includes(i)
                      ? ' bg-palettes-theme-accent border-palettes-theme-accent'
                      : ' bg-palettes-theme-white dark:bg-palettes-theme-black border-standards-gray-label'
                  "
                  v-for="(day, i) in weekdays"
                  @click="setRepeatWeekDay(i)"
                >
                  {{ day[0] }}
                </div>
              </div>
            </div>

            <!-- Extra month fields -->
            <div
              class="ml-5"
              v-if="repeatCustom_period && repeatCustom_period.int == 30"
            >
              <span class="text-xs font-semibold">Wordt herhaald op</span>
              <ul class="mt-1">
                <li
                  class="flex items-center gap-1 cursor-pointer w-max"
                  @click="setMonthRepeat('current')"
                >
                  <icon
                    name="solar:check-circle-bold"
                    class="w-4 h-4 text-palettes-theme-primary transform -translate-x-[1px]"
                    v-if="selectedRepeatday == 'current'"
                  />
                  <div
                    class="w-3.5 h-3.5 bg-standards-gray-dark dark:bg-standards-gray-mid rounded-full"
                    v-else
                  ></div>
                  <span
                    class="text-sm w-max"
                    :class="
                      error.errorName != 'dateRepeatdayError'
                        ? 'text-palettes-theme-gray dark:text-standards-gray-mid'
                        : 'text-red-400'
                    "
                  >
                    {{ `Maandelijks op dag ${selectedDayInMonth}` }}
                  </span>
                </li>
                <li
                  v-if="weeknumberInt < 5"
                  class="flex items-center gap-1 cursor-pointer w-max"
                  @click="setMonthRepeat('weeknumber')"
                >
                  <icon
                    name="solar:check-circle-bold"
                    class="w-4 h-4 text-palettes-theme-primary transform -translate-x-[1px]"
                    v-if="selectedRepeatday == 'weeknumber'"
                  />
                  <div
                    class="w-3.5 h-3.5 bg-standards-gray-dark dark:bg-standards-gray-mid rounded-full"
                    v-else
                  ></div>
                  <span
                    class="text-sm w-max"
                    :class="
                      error.errorName != 'dateRepeatdayError'
                        ? 'text-palettes-theme-gray dark:text-standards-gray-mid'
                        : 'text-red-400'
                    "
                  >
                    {{ `Maandelijks op ${weeknumberVisual}` }}
                  </span>
                </li>
                <li
                  v-if="weeknumberInt == occurencesInMonth"
                  class="flex items-center gap-1 cursor-pointer w-max"
                  @click="setMonthRepeat('last')"
                >
                  <icon
                    name="solar:check-circle-bold"
                    class="w-4 h-4 text-palettes-theme-primary transform -translate-x-[1px]"
                    v-if="selectedRepeatday == 'last'"
                  />
                  <div
                    class="w-3.5 h-3.5 bg-standards-gray-dark dark:bg-standards-gray-mid rounded-full"
                    v-else
                  ></div>
                  <span
                    class="text-sm w-max"
                    :class="
                      error.errorName != 'dateRepeatdayError'
                        ? 'text-palettes-theme-gray dark:text-standards-gray-mid'
                        : 'text-red-400'
                    "
                  >
                    {{ `Maandelijks op de laatste ${dayname} ` }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- einddatum voor herhalen -->
            <div
              class="ml-5 mt-4 relative flex items-center"
              v-if="bookingIsRepeated"
            >
              <input
                type="date"
                v-model="repeatDateTo"
                id="repeatDateTo"
                class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
                :class="
                  error.errorName != 'dateRepeatError'
                    ? 'border-gray-100 text-standards-gray-label'
                    : ' border-red-400 text-red-400'
                "
              />
              <label
                for="repeatDateTo"
                class="absolute left-2 transition-all cursor-pointer"
                :class="
                  error.errorName != 'dateRepeatError'
                    ? ' text-standards-gray-label'
                    : ' text-red-400'
                "
                >Herhaal t/m*</label
              >
            </div>

            <!-- Uitgesloten data -->
            <div class="ml-5" v-if="bookingIsRepeated">
              <span class="text-xs font-semibold">
                {{
                  excludedDates && excludedDates.length != 0
                    ? excludedDates.length == 1
                      ? "Uitgesloten datum"
                      : "Uitgesloten data"
                    : "Kies data om uit te sluiten"
                }}
              </span>
              <VueDatePicker
                v-model="excludedDates"
                locale="nl"
                cancelText="Annuleren"
                selectText="Selecteren"
                :enable-time-picker="false"
                format="dd-MM-yyyy"
                multi-dates
              ></VueDatePicker>
            </div>
          </div>

          <hr />

          <!-- description -->
          <div class="relative flex items-center">
            <textarea
              v-model="description"
              id="description"
              class="w-full border-gray-100 text-standards-gray-label rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
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
              v-model="pax"
              placeholder="Aantal personen"
              id="pax"
              class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
              :class="
                error.errorName != 'paxError'
                  ? 'border-gray-100 text-standards-gray-label'
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
              v-model="roomsetup"
              placeholder="Zaalopstelling"
              id="roomsetup"
              class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield"
              :class="
                error.errorName != 'setupError'
                  ? 'border-gray-100 text-standards-gray-label'
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
                  ? 'text-standards-gray-light dark:text-standards-gray-midnight bg-standards-gray-dark dark:bg-standards-gray-label'
                  : 'text-standards-gray-mid dark:text-palettes-theme-black bg-standards-gray-label dark:bg-standards-gray-dark'
              "
              @click="selectedTab = 'rooms'"
            >
              <icon name="solar:signpost-bold-duotone" class="w-5 h-5" />
              <span class="font-semibold">{{ selectedRooms.length }}</span>
            </div>

            <div
              class="font-extralight text-sm cursor-pointer p-1 rounded-t-lg overflow-hidden min-w-max flex gap-2 item-center"
              :class="
                selectedTab == 'perks'
                  ? 'text-standards-gray-light dark:text-standards-gray-midnight bg-standards-gray-dark dark:bg-standards-gray-label'
                  : 'text-standards-gray-mid dark:text-palettes-theme-black bg-standards-gray-label dark:bg-standards-gray-dark'
              "
              @click="selectedTab = 'perks'"
            >
              <icon name="solar:cup-bold-duotone" class="w-5 h-5" />
              <span class="font-semibold">{{ selectedPerks.length }}</span>
            </div>

            <div
              class="font-extralight text-sm cursor-pointer p-1 rounded-t-lg overflow-hidden min-w-max flex gap-2 item-center"
              :class="
                selectedTab == 'persons'
                  ? 'text-standards-gray-light dark:text-standards-gray-midnight bg-standards-gray-dark dark:bg-standards-gray-label'
                  : 'text-standards-gray-mid dark:text-palettes-theme-black bg-standards-gray-label dark:bg-standards-gray-dark'
              "
              @click="selectedTab = 'persons'"
            >
              <icon name="solar:user-rounded-bold-duotone" class="w-5 h-5" />
              <span class="font-semibold">{{ selectedPersons.length }}</span>
            </div>

            <div
              class="font-extralight text-sm cursor-pointer p-1 rounded-t-lg overflow-hidden min-w-max flex gap-2 item-center"
              :class="
                selectedTab == 'settings'
                  ? 'text-standards-gray-light dark:text-standards-gray-midnight bg-standards-gray-dark dark:bg-standards-gray-label'
                  : 'text-standards-gray-mid dark:text-palettes-theme-black bg-standards-gray-label dark:bg-standards-gray-dark'
              "
              @click="selectedTab = 'settings'"
            >
              <icon name="solar:feed-bold-duotone" class="w-5 h-5" />
              <span class="font-semibold uppercase">{{
                isExportable ? "Y" : "N"
              }}</span>
            </div>
          </div>

          <!-- Rooms -->
          <div
            class="flex flex-col justify-start gap-4 w-full"
            v-if="selectedTab == 'rooms'"
          >
            <ul
              class="w-full border-standards-gray-label bg-gray-100 dark:bg-standards-gray-midnight text-palettes-theme-gray dark:text-palettes-theme-white rounded-md p-2 focus:outline-0"
            >
              <div class="" v-if="rooms.length != 0">
                <li
                  v-for="room in rooms"
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
              <span class="font-semibold" v-else
                >Er zijn geen zalen voor deze locatie</span
              >
              <div
                v-if="allAccessibleRoomsInt > 0"
                class="flex gap-2 mt-2 cursor-pointer"
                @click="showAccessibleRooms = !showAccessibleRooms"
              >
                <icon name="solar:buildings-bold-duotone" class="w-5 h-5" />
                <span class="text-sm font-semibold">Toon overige locaties</span>
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
                  <icon
                    name="solar:check-read-line-duotone"
                    v-if="isSelectedRoom(location)"
                    class="h-5 w-5 text-palettes-theme-primary"
                  />
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
              class="w-full border-standards-gray-label bg-gray-100 dark:bg-standards-gray-midnight text-palettes-theme-gray dark:text-palettes-theme-white rounded-md p-2 focus:outline-0"
            >
              <li
                v-for="perk in perks"
                :key="perk.name"
                class="flex items-center gap-2 cursor-pointer justify-between"
              >
                <div class="flex items-center gap-2 justify-start">
                  <div
                    class="flex items-center gap-2"
                    @click="selectPerk(perk)"
                  >
                    <div
                      class="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-black"
                    >
                      <icon
                        name="solar:check-read-line-duotone"
                        v-if="isSelectedPerk(perk)"
                        class="h-5 w-5 text-palettes-theme-primary"
                      />
                    </div>
                  </div>
                  {{ perk.name }}
                </div>
                <div
                  class="flex items-center"
                  v-if="perk.hasCustomAmount && isSelectedPerk(perk)"
                >
                  <icon
                    @click="[perk.count--, updateSelection(perk)]"
                    name="solar:minus-square-bold-duotone"
                    class="w-5 h-5 cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid"
                    :class="perk.count == 0 ? 'invisible' : 'visible'"
                  />
                  <input
                    type="number"
                    v-model="perk.count"
                    @change="updateSelection(perk)"
                    min="0"
                    class="w-8 text-xs bg-transparent text-center"
                  />
                  <icon
                    @click="[perk.count++, updateSelection(perk)]"
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
                      v-if="isSelectedPerson(admin)"
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
              @click="isExportable = !isExportable"
            >
              <div
                class="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-black"
              >
                <icon
                  name="solar:check-read-line-duotone"
                  v-if="isExportable"
                  class="h-5 w-5 text-palettes-theme-primary"
                />
              </div>
              Exporteerbaar
            </div>
            <div class="relative flex items-center w-full">
              <input
                type="text"
                v-model="rssLocation"
                placeholder="RSS locatienaam"
                id="rssLocation"
                class="w-full rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield border-gray-100 text-standards-gray-label"
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
              error.errorType == 'error' ? 'text-red-400' : ' text-green-mid'
            "
          >
            {{ error.errorMessage }}
          </p>
          <!-- BTN's -->
          <div class="relative flex items-center gap-4 select-none">
            <button
              type="confirm"
              class="bg-palettes-theme-primary rounded-lg text-white uppercase transform transition-all font-medium text-sm px-5 h-9.5 relative overflow-hidden"
              :class="
                isLoading
                  ? ' bg-opacity-60 cursor-not-allowed'
                  : ' bg-opacity-100 cursor-pointer'
              "
            >
              <div
                v-if="isLoading && progress"
                class="absolute left-0 top-0 h-full transition-all duration-300 ease-in-out z-10 bg-black bg-opacity-20 animate-pulse"
                :style="`width:${(progress.value / progress.total) * 100}%`"
              ></div>
              <div
                class="flex items-center text-palettes-theme-white gap-1 relative z-20"
                v-if="isLoading"
              >
                <Icon name="solar:hourglass-broken" class="h-6 w-6 hourglass" />
                <span v-if="progress"
                  >{{
                    Math.floor((progress.value / progress.total) * 100)
                  }}%</span
                >
              </div>

              <span v-else> Opslaan </span>
            </button>
            <div
              @click="[$emit('closeOverlay'), resetValues()]"
              class="bg-standards-gray-label rounded-lg text-palettes-theme-gray uppercase font-medium text-sm px-5 h-9.5 flex items-center cursor-pointer"
            >
              Annuleren
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useGeneralStore } from "@/store/general";
import { useUserStore } from "@/store/user";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import dayjs from "dayjs";
import "dayjs/locale/nl";
import weekday from "dayjs/plugin/weekday";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import io from "socket.io-client";
export default {
  props: [
    "rooms",
    "allRoomsAccessible",
    "allAccessibleRoomsInt",
    "perks",
    "admins",
    "selectedDay",
    "selectedMonth",
    "selectedYear",
    "preSetData",
  ],

  components: { VueDatePicker },

  setup(props, { emit }) {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();
    const generalStore = useGeneralStore();
    // const socket_addBooking = io("wss://vilgaard.vercel.app:3014");
    // const socket_rewriteTS = io("wss://vilgaard.vercel.app:3015");
    const progress = ref(null);

    // socket.on("connect", () => {
    //   console.log("connected");
    // });
    // socket_addBooking.on("progress", (p, total) => {
    //   progress.value = {
    //     value: p,
    //     total: total,
    //   };
    // });
    // socket_addBooking.on("disconnect", () => {
    //   progress.value = null;
    // });
    // socket_rewriteTS.on("progress", (p, total, startInt) => {
    //   emit("updateProgress", {
    //     value: p - startInt,
    //     total: total - startInt,
    //   });
    //   progress.value = {
    //     value: p - startInt,
    //     total: total - startInt,
    //   };
    // });
    // socket_rewriteTS.on("disconnect", () => {
    //   emit("updateProgress", null);
    //   progress.value = null;
    // });

    const name = ref("");
    const description = ref("");
    const roomsetup = ref("");
    const pax = ref("");
    const datesFullDay = ref(false);
    const dateFrom = ref("");
    const timeFrom = ref(
      `${dayjs().locale("nl").format("HH")}:${dayjs()
        .locale("nl")
        .format("mm")}`
    );
    const dateTo = ref("");
    const timeTo = ref(
      `${dayjs().locale("nl").format("HH")}:${dayjs()
        .locale("nl")
        .format("mm")}`
    );
    const repeatDateTo = ref("");
    const error = ref({ errorName: null, errorMessage: "", errorType: null });
    const isLoading = ref(false);
    const selectedRooms = ref([]);
    const selectedPerks = ref([]);
    const selectedPersons = ref([]);
    const selectedTab = ref("rooms");
    const selectedRepeatday = ref(null);
    const rssLocation = ref("");
    const showRepeatOptions = ref(false);
    const bookingIsRepeated = ref(false);
    const excludedDates = ref();
    const repeatOptions = [
      { display: { singular: "Dag", plural: "Dagen" }, int: 1 },
      { display: { singular: "Week", plural: "Weken" }, int: 7 },
      {
        display: { singular: "Maand", plural: "Maanden" },
        int: 30,
        repeatday: undefined,
        repeatOn: {
          int: undefined,
          day: undefined,
        },
      },
      { display: { singular: "Jaar", plural: "Jaren" }, int: 365 },
    ];
    const weekdays = [
      "Maandag",
      "Dinsdag",
      "Woensdag",
      "Donderdag",
      "Vrijdag",
      "Zaterdag",
      "Zondag",
    ];
    const showRepeatPeriodDD = ref(false);
    const toggleRepeatCustomIntervalDD = ref(false);
    const repeatCustom_interval = ref(1);
    const repeatCustom_period = ref(null);
    const repeatCustom_repeatOn = ref({ int: undefined, day: undefined });
    const selectedWeekDays = ref([]);
    const isExportable = ref(true);
    const repeatUntil = ref(null);
    const showAccessibleRooms = ref(false);
    const selectDay = toRefs(props).selectedDay;
    const selectMonth = toRefs(props).selectedMonth;
    const selectYear = toRefs(props).selectedYear;
    const clonedData = toRefs(props).preSetData;

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const repeatCustom_periodVisual = computed(() => {
      if (repeatCustom_period.value) {
        return repeatCustom_interval.value == 1
          ? repeatCustom_period.value.display.singular
          : repeatCustom_period.value.display.plural;
      }
    });

    const selectedDayInMonth = computed(() => {
      return dayjs(dateFrom.value).locale("nl").get("date");
    });

    const dayname = computed(() => {
      dayjs.extend(weekday);
      dayjs.locale("nl");
      const daynumber = dayjs(dateFrom.value).weekday();
      return weekdays[daynumber].toLowerCase();
    });

    const daynumber = computed(() => {
      dayjs.extend(weekday);
      dayjs.locale("nl");
      return dayjs(dateFrom.value).weekday();
    });

    const weeknumberVisual = computed(() => {
      const currentDate = dayjs(dateFrom.value).locale("nl");
      return `${getWeekOfMonth(currentDate)}e ${currentDate.format("dddd")}`;
    });

    const weeknumberInt = computed(() => {
      const currentDate = dayjs(dateFrom.value);
      return getWeekOfMonth(currentDate);
    });

    const occurencesInMonth = computed(() => {
      dayjs.extend(isSameOrBefore);
      const targetDate = dayjs(dateFrom.value).locale("nl");

      // Get the day of the week for the given date (0 for Sunday, 1 for Monday, etc.)
      const targetDayOfWeek = targetDate.day();

      // Create a dayjs object for the first day of the month
      const firstDayOfMonth = targetDate.startOf("month");

      // Get the last day of the month
      const lastDayOfMonth = targetDate.endOf("month");

      // Initialize a counter for the target day of the week occurrences
      let count = 0;

      // Iterate through each day in the month
      let currentDate = firstDayOfMonth;
      while (currentDate.isSameOrBefore(lastDayOfMonth)) {
        if (currentDate.day() === targetDayOfWeek) {
          count++;
        }
        // Move to the next day
        currentDate = currentDate.add(1, "day");
      }

      return count;
    });

    const getWeekOfMonth = (date) => {
      const startOfMonth = date.startOf("month");
      const diff = date.diff(startOfMonth, "day");
      const weekNumber = Math.floor(diff / 7) + 1;
      return weekNumber;
    };

    const setRepeatPeriod = (period) => {
      repeatCustom_period.value = period;
      showRepeatPeriodDD.value = false;
    };

    const setMonthRepeat = (value) => {
      repeatCustom_period.value.repeatday = value;
      selectedRepeatday.value = value;
      if (value == "weeknumber" || value == "last") {
        repeatCustom_repeatOn.value.int = weeknumberInt;
        repeatCustom_repeatOn.value.day = daynumber;
      }
    };

    const setRepeatWeekDay = (i) => {
      const j = selectedWeekDays.value.indexOf(i);
      if (j > -1) {
        selectedWeekDays.value.splice(j, 1);
      } else {
        selectedWeekDays.value.push(i);
      }
      repeatCustom_repeatOn.value = selectedWeekDays.value;
    };

    const resetValues = () => {
      name.value = "";
      description.value = "";
      roomsetup.value = "";
      pax.value = "";
      dateTo.value = `${selectYear.value}-${String(selectMonth.value).padStart(
        2,
        "0"
      )}-${String(selectDay.value).padStart(2, "0")}`;
      timeTo.value = `${dayjs().locale("nl").hour()}:${String(
        dayjs().locale("nl").minute()
      ).padStart(2, "0")}`;
      dateFrom.value = `${selectYear.value}-${String(
        selectMonth.value
      ).padStart(2, "0")}-${String(selectDay.value).padStart(2, "0")}`;
      timeFrom.value = `${dayjs().locale("nl").hour()}:${String(
        dayjs().locale("nl").minute()
      ).padStart(2, "0")}`;
      repeatDateTo.value = `${selectYear.value}-${String(
        selectMonth.value
      ).padStart(2, "0")}-${String(selectDay.value).padStart(2, "0")}`;
      datesFullDay.value = false;
      selectedRooms.value = [];
      selectedPerks.value = [];
      selectedTab.value = "rooms";
      isExportable.value = true;
      rssLocation.value = "";
    };

    const selectRoom = (room) => {
      if (isSelectedRoom(room)) {
        // Deselect the room
        selectedRooms.value = selectedRooms.value.filter(
          (r) => r.id !== room.id
        );
      } else {
        // Select the room
        selectedRooms.value.push(room);
      }
    };

    const selectPerk = (perk) => {
      if (isSelectedPerk(perk)) {
        // Deselect the perk
        selectedPerks.value = selectedPerks.value.filter(
          (p) => p.id !== perk.id
        );
      } else {
        // Select the perk
        selectedPerks.value.push(perk);
      }
    };

    const isSelectedPerk = (perk) => {
      let val = false;
      selectedPerks.value.map((p) => {
        if (p.id == perk.id) {
          val = true;
        }
      });
      return val;
    };

    const isSelectedRoom = (room) => {
      let val = false;
      selectedRooms.value.map((r) => {
        if (r.id == room.id) {
          val = true;
        }
      });
      return val;
    };

    const isSelectedPerson = (person) => {
      let val = false;
      selectedPersons.value.map((p) => {
        if (p.id == person.id) {
          val = true;
        }
      });
      return val;
    };

    const selectPerson = (person) => {
      if (isSelectedPerson(person)) {
        // Deselect the person
        selectedPersons.value = selectedPersons.value.filter(
          (p) => p.id !== person.id
        );
      } else {
        // Select the person
        selectedPersons.value.push(person);
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

    const addBooking = async () => {
      dayjs.extend(customParseFormat);
      error.value.errorName = null;
      error.value.errorMessage = "";
      error.value.errorType = null;
      if (
        dayjs(
          `${dateTo.value} ${timeTo.value}`,
          "YYYY-MM-DD HH:mm",
          "nl"
        ).valueOf() <
        dayjs(
          `${dateFrom.value} ${timeFrom.value}`,
          "YYYY-MM-DD HH:mm",
          "nl"
        ).valueOf()
      ) {
        error.value.errorName = "dateError";
        error.value.errorMessage = "De einddatum ligt voor de startdatum.";
        error.value.errorType = "error";
        return;
      }

      if (
        datesFullDay.value == false &&
        dayjs(
          `${dateTo.value} ${timeTo.value}`,
          "YYYY-MM-DD HH:mm",
          "nl"
        ).valueOf() ==
          dayjs(
            `${dateFrom.value} ${timeFrom.value}`,
            "YYYY-MM-DD HH:mm",
            "nl"
          ).valueOf()
      ) {
        error.value.errorName = "dateError";
        error.value.errorMessage =
          "De start- en einddatum kunnen niet gelijk zijn.";
        error.value.errorType = "error";
        return;
      }

      if (bookingIsRepeated.value && repeatCustom_interval.value == "") {
        error.value.errorName = "repeatIntervalError";
        error.value.errorMessage = "Je hebt geen herhalingsinterval ingevoerd.";
        error.value.errorType = "error";
        return;
      }

      if (bookingIsRepeated.value && !repeatCustom_period.value) {
        error.value.errorName = "repeatPeriodError";
        error.value.errorMessage = "Je hebt geen periode ingevoerd.";
        error.value.errorType = "error";
        return;
      }

      if (
        bookingIsRepeated.value &&
        repeatCustom_period.value.int == 30 &&
        repeatCustom_period.value.repeatday == undefined
      ) {
        error.value.errorName = "dateRepeatdayError";
        error.value.errorMessage =
          "Kies een optie waarop de reservering herhaald moet worden.";
        error.value.errorType = "error";
        return;
      }

      if (
        bookingIsRepeated.value &&
        !dayjs(`${repeatDateTo.value}`, "YYYY-MM-DD", true).isValid()
      ) {
        error.value.errorName = "dateRepeatError";
        error.value.errorMessage =
          "Geef een geldige eindperiode voor de herhaling op.";
        error.value.errorType = "error";
        return;
      }

      if (
        bookingIsRepeated.value &&
        dayjs(`${repeatDateTo.value}`, "YYYY-MM-DD", "nl") <=
          dayjs(`${dateFrom.value}`, "YYYY-MM-DD", "nl")
      ) {
        error.value.errorName = "dateRepeatError";
        error.value.errorMessage =
          "De herhaal-einddatum ligt voor / is gelijk aan de startdatum van de reservering.";
        error.value.errorType = "error";
        return;
      }

      if (
        bookingIsRepeated.value &&
        repeatCustom_period.value.int == 7 &&
        selectedWeekDays.value.length == 0
      ) {
        error.value.errorName = "dateRepeatdayWeekError";
        error.value.errorMessage =
          "Kies een dag van de week waarop de reservering herhaald moet worden.";
        error.value.errorType = "error";
        return;
      }

      if (
        bookingIsRepeated.value &&
        repeatCustom_period.value.int != 365 &&
        dayjs(`${repeatDateTo.value}`, "YYYY-MM-DD", "nl").valueOf() -
          dayjs(
            `${dateFrom.value} ${timeFrom.value}`,
            "YYYY-MM-DD HH:mm",
            "nl"
          ).valueOf() >
          31557600000
      ) {
        error.value.errorName = "dateRepeatError";
        error.value.errorMessage =
          "Je kunt tot maximaal een jaar aan herhaalde reserveringen maken.";
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

      // TODO: it should check for repeated bookings, if the from and start date of each booking doesn't clash with the repeat conditions. (what if booking duration = 1 month and repeat options is set to week?)

      // TODO: consider a minimum of 5 minutes between start and end
      let obj = {
        name: name.value,
        description: description.value,
        roomsetup: roomsetup.value,
        pax: pax.value,
        fullDay: datesFullDay.value,
        dateFrom: dateFrom.value,
        timeFrom: timeFrom.value,
        dateTo: dateTo.value,
        timeTo: timeTo.value,
        rooms: selectedRooms.value,
        perks: selectedPerks.value,
        persons: selectedPersons.value,
        isExportable: isExportable.value,
        rssLocation: rssLocation.value,
        bookingIsRepeated: bookingIsRepeated.value,
        repeatOptions: {
          interval: repeatCustom_interval.value,
          periode: repeatCustom_period.value,
          repeatUntil: repeatDateTo.value,
          repeatOn: repeatCustom_repeatOn.value,
        },
        excludedDates: excludedDates.value,
      };

      isLoading.value = true;
      let err = false;

      await $fetch("/api/createBooking", {
        method: "post",
        body: {
          auth: $authDirect(),
          details: obj,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
          isLoading.value = false;
          if (returnBody.snackbar.type == "error") {
            err = true;
          } else {
            resetValues();
            emit("closeOverlay");
          }
        }
      });

      if (!err) {
        await $fetch("/api/rewriteToFNS", {
          method: "post",
          body: {
            auth: $authDirect(),
          },
        }).then((res) => {
          const returnBody = JSON.parse(res.body);
          if (returnBody.snackbar) {
            snackbar.add(returnBody.snackbar);

            if (returnBody.snackbar.type == "success") {
              emit("hideProgress");
            }
          }
        });
      }

      emit("updateBookings");
    };

    watch(selectDay, (n) => {
      if (n) {
        dateTo.value = `${selectYear.value}-${String(
          selectMonth.value
        ).padStart(2, "0")}-${String(selectDay.value).padStart(2, "0")}`;

        dateFrom.value = `${selectYear.value}-${String(
          selectMonth.value
        ).padStart(2, "0")}-${String(selectDay.value).padStart(2, "0")}`;

        repeatDateTo.value = `${selectYear.value}-${String(
          selectMonth.value
        ).padStart(2, "0")}-${String(selectDay.value).padStart(2, "0")}`;
      }
    });

    watch(selectMonth, (n) => {
      if (n) {
        dateTo.value = `${selectYear.value}-${String(
          selectMonth.value
        ).padStart(2, "0")}-${String(selectDay.value).padStart(2, "0")}`;

        dateFrom.value = `${selectYear.value}-${String(
          selectMonth.value
        ).padStart(2, "0")}-${String(selectDay.value).padStart(2, "0")}`;

        repeatDateTo.value = `${selectYear.value}-${String(
          selectMonth.value
        ).padStart(2, "0")}-${String(selectDay.value).padStart(2, "0")}`;
      }
    });

    watch(datesFullDay, (n) => {
      if (n) {
        timeFrom.value = "00:00";
        timeTo.value = "23:59";
      } else {
        timeTo.value = "00:00";
        timeFrom.value = "00:00";
      }
    });

    watch(dateFrom, (n) => {
      dateTo.value = n;
    });

    const updateSelection = (perk) => {
      selectPerk(perk);
      selectPerk(perk);
    };

    watch(clonedData, (n) => {
      if (n) {
        name.value = n.name;
        description.value = n.description;
        roomsetup.value = n.roomsetup;
        pax.value = n.pax;
        datesFullDay.value = n.fullDay;
        n.assemblee.map((a) => {
          selectPerk({ ...a.assemblee, count: a.count });
        });
        props.perks.forEach((perk) => {
          if (perk.hasCustomAmount) {
            const matchingPresetPerk = n.assemblee.find(
              (presetPerk) => presetPerk.assemblee.id === perk.id
            );

            if (matchingPresetPerk) {
              perk.count = matchingPresetPerk.count;
            }
          }
        });
        n.rooms.map((r) => {
          selectRoom(r);
        });
        n.persons.map((p) => {
          selectPerson(p);
        });
        rssLocation.value = n.rssLocation;
        isExportable.value = n.isExportable;
      }
    });

    onMounted(() => {
      setRepeatPeriod(repeatOptions[1]);
    });

    return {
      error,
      name,
      datesFullDay,
      dateFrom,
      timeFrom,
      dateTo,
      timeTo,
      repeatDateTo,
      description,
      roomsetup,
      isLoading,
      addBooking,
      selectedRooms,
      selectedPerks,
      selectedPersons,
      selectedTab,
      selectPerson,
      pax,
      showRepeatOptions,
      selectRoom,
      selectPerk,
      isExportable,
      rssLocation,
      toggleRepeatCustomIntervalDD,
      repeatCustom_interval,
      repeatCustom_period,
      repeatCustom_periodVisual,
      weekdays,
      bookingIsRepeated,
      repeatOptions,
      showRepeatPeriodDD,
      setRepeatPeriod,
      setRepeatWeekDay,
      selectedWeekDays,
      dayname,
      setMonthRepeat,
      selectedRepeatday,
      weeknumberVisual,
      weeknumberInt,
      occurencesInMonth,
      excludedDates,
      isSelectedPerk,
      isSelectedRoom,
      isSelectedPerson,
      resetValues,
      selectedDayInMonth,
      updateSelection,
      hasAccessToComponent,
      showAccessibleRooms,
      progress,
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
  @apply bg-standards-gray-label dark:bg-standards-gray-mid;
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

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>